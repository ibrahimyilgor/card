// Basit bir örnek jest testi
function sum(a, b) {
  return a + b;
}

test('1 + 2 toplama doğru çalışıyor', () => {
  expect(sum(1, 2)).toBe(3);
});
