export const generateSalesKit = (product: any) => {
  return `
    <div class="sales-kit">
      <h1>${product.name}</h1>
      <p>${product.description}</p>
      <div class="price">Giá: ${product.price}đ</div>
      <button onclick="window.location.href='/order/${product.id}'">Đặt hàng ngay</button>
    </div>
  `;
};
