// Basit bir örnek jest testi
function sum(a, b) {
  return a + b;
}

test('2 + 3 toplama doğru çalışıyor', () => {
  expect(sum(2, 3)).toBe(5);
});
