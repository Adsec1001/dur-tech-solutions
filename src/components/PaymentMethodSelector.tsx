import { Input } from "@/components/ui/input";
import { Banknote, CreditCard, CalendarRange } from "lucide-react";
import { PaymentMethod } from "@/types/serviceJob";

interface Props {
  method: PaymentMethod;
  installments: number;
  onChange: (method: PaymentMethod, installments: number) => void;
  fee?: number;
  paid?: number;
}

const KDV_RATE = 0.20;

export const calcKdv = (amount: number) => {
  const kdv = +(amount * KDV_RATE).toFixed(2);
  return { kdv, withKdv: +(amount + kdv).toFixed(2) };
};

const PaymentMethodSelector = ({ method, installments, onChange, fee = 0, paid = 0 }: Props) => {
  const remaining = Math.max(0, (fee || 0) - (paid || 0));
  // For card/installment, KDV is always calculated on the full entered fee (price + 20% VAT on top)
  const kdvBase = method === "nakit" ? remaining : (fee || 0);
  const { kdv, withKdv } = calcKdv(kdvBase);
  const perInstallment = method === "taksit" && installments > 0 ? +(withKdv / installments).toFixed(2) : 0;
  const showBreakdown = (method === "nakit" && remaining > 0) || ((method === "kart" || method === "taksit") && (fee || 0) > 0);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">💳 Ödeme Yöntemi</p>
      <div className="flex gap-2 flex-wrap">
        <button type="button" onClick={() => onChange("nakit", 1)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${method === "nakit" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
          <Banknote className="h-4 w-4" /> Nakit
        </button>
        <button type="button" onClick={() => onChange("kart", 1)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${method === "kart" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
          <CreditCard className="h-4 w-4" /> Kart
        </button>
        <button type="button" onClick={() => onChange("taksit", Math.max(2, installments || 2))}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${method === "taksit" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
          <CalendarRange className="h-4 w-4" /> Taksit
        </button>
        {method === "taksit" && (
          <div className="flex items-center gap-1">
            <Input type="number" min={2} max={36} className="w-20 h-9"
              value={installments}
              onChange={e => onChange("taksit", Math.max(2, parseInt(e.target.value) || 2))} />
            <span className="text-xs text-muted-foreground">taksit</span>
          </div>
        )}
      </div>
      {showBreakdown && (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-2 text-xs space-y-0.5">
          <div className="flex justify-between"><span className="text-muted-foreground">{method === "nakit" ? "Kalan:" : "Tutar:"}</span><span className="font-medium text-foreground">{kdvBase.toLocaleString("tr-TR")}₺</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">KDV (%20):</span><span className="font-medium text-orange-400">{kdv.toLocaleString("tr-TR")}₺</span></div>
          <div className="flex justify-between border-t border-border/40 pt-0.5"><span className="text-muted-foreground">KDV Dahil Toplam:</span><span className="font-bold text-primary">{withKdv.toLocaleString("tr-TR")}₺</span></div>
          {method === "taksit" && perInstallment > 0 && (
            <div className="flex justify-between"><span className="text-muted-foreground">{installments} x Taksit:</span><span className="font-semibold text-foreground">{perInstallment.toLocaleString("tr-TR")}₺ / ay</span></div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;