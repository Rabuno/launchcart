export default function OrderPage({ params }: { params: { id: string } }) {
  return (
    <form className="p-8 space-y-4">
      <h1 className="text-xl">Đặt hàng sản phẩm {params.id}</h1>
      <input type="text" placeholder="Tên của bạn" className="border p-2 w-full" />
      <input type="tel" placeholder="Số điện thoại" className="border p-2 w-full" />
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">Gửi đơn hàng</button>
    </form>
  );
}
