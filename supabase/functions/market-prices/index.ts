import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

interface ItemIn {
  id: string;
  name: string;
  category?: string | null;
  variation?: string | null;
  brand?: string | null;
  model?: string | null;
  price?: number | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return new Response(JSON.stringify({ error: "Giriş gerekli" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const client = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user }, error: authError } = await client.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Geçersiz oturum" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: admin, error: roleError } = await client.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (roleError || admin !== true) return new Response(JSON.stringify({ error: "Yetki gerekli" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI anahtarı yapılandırılmamış" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const schema = z.object({ items: z.array(z.object({ id: z.string().uuid(), name: z.string().min(1).max(255), category: z.string().max(100).nullish(), variation: z.string().max(100).nullish(), brand: z.string().max(100).nullish(), model: z.string().max(100).nullish(), price: z.number().nonnegative().nullish() })).max(120) });
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new Response(JSON.stringify({ error: "Geçersiz ürün listesi" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { items } = parsed.data;
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ prices: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const list = items.slice(0, 120).map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category ?? "",
      variation: i.variation ?? "",
      brand: i.brand ?? "",
      model: i.model ?? "",
      current_price: i.price ?? 0,
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Sen Türkiye güvenlik kamera sistemleri toptan/perakende pazarını bilen bir fiyat uzmanısın. " +
              "Verilen ürün listesi için Türkiye'deki güncel yaklaşık perakende satış fiyatlarını Türk Lirası (TRY, KDV dahil) olarak tahmin et. " +
              "Her ürün için mutlaka bir sayısal fiyat üret; emin değilsen kategori ve markaya göre makul bir piyasa ortalaması ver. " +
              "Sadece araç çağrısı ile yanıt ver.",
          },
          {
            role: "user",
            content: `Bugünün tarihi: ${new Date().toISOString().split("T")[0]}\nÜrünler:\n${JSON.stringify(list)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_prices",
              description: "Ürünler için güncel tahmini piyasa fiyatlarını gönder",
              parameters: {
                type: "object",
                properties: {
                  prices: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        price: { type: "number", description: "Güncel tahmini fiyat, TRY" },
                        note: { type: "string", description: "Kısa açıklama / fiyat aralığı" },
                      },
                      required: ["id", "price"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["prices"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_prices" } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      const status = response.status === 429 || response.status === 402 ? response.status : 500;
      return new Response(
        JSON.stringify({
          error:
            response.status === 429
              ? "Çok fazla istek, biraz sonra tekrar deneyin."
              : response.status === 402
              ? "AI kredisi tükendi."
              : "Fiyatlar alınamadı",

        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    let prices: unknown = [];
    if (call?.function?.arguments) {
      try {
        prices = JSON.parse(call.function.arguments)?.prices ?? [];
      } catch {
        prices = [];
      }
    }

    return new Response(JSON.stringify({ prices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "İşlem tamamlanamadı" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
