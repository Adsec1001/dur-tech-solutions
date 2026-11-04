import { test } from "node:test";
import { strict as assert } from "node:assert";
import { computerRevenue, computerProfit, computerPayment, type Peripheral } from "./computerTotals";

const peripherals: Peripheral[] = [
  { id: "monitor", type: "monitor", name: "Set monitörü", purchase_price: 1000, sale_mode: "set", sale_price: 1500 },
  { id: "mouse", type: "mouse", name: "Ayrı mouse", purchase_price: 100, sale_mode: "ayri", sale_price: 300 },
];
const sale = { sale_price: 10000, purchase_price: 7000, peripherals };

test("set birimi tekrar fiyatlandırılmaz, ayrı satış toplam tutara eklenir", () => {
  assert.equal(computerRevenue(sale), 10300);
});
test("net kâr tüm çevre birimi alış maliyetlerini düşer", () => {
  assert.equal(computerProfit(sale), 2200);
});
test("kısmi ödeme kalan borcu hesaplar", () => {
  assert.deepEqual(computerPayment({ ...sale, paid_amount: 4000 }), { total: 10300, paid: 4000, remaining: 6300, status: "partial" });
});
test("ödendi seçildiğinde kalan borç sıfırdır", () => {
  assert.equal(computerPayment({ ...sale, paid_amount: 10300 }).status, "paid");
  assert.equal(computerPayment({ ...sale, paid_amount: 10300 }).remaining, 0);
});
test("ödenmedi seçildiğinde toplam borç kalır", () => {
  assert.deepEqual(computerPayment({ ...sale, paid_amount: 0 }), { total: 10300, paid: 0, remaining: 10300, status: "unpaid" });
});
test("tahsilat sınırları negatif ve fazla ödemeyi önler", () => {
  assert.equal(computerPayment({ ...sale, paid_amount: -1 }).paid, 0);
  assert.equal(computerPayment({ ...sale, paid_amount: 20000 }).paid, 10300);
});