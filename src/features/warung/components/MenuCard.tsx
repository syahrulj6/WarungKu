export const MenuCard = ({ title, price, available, imageUrl }: any) => (
  <div className="rounded-xl bg-white p-4 text-center shadow">
    <img
      src={imageUrl}
      alt={title}
      className="mx-auto mb-4 h-32 w-full object-contain"
    />
    <h3 className="font-semibold">{title}</h3>
    <p className="font-bold text-orange-500">${price.toFixed(2)}</p>
    <p className="text-sm text-gray-500">{available} Pan Available</p>
  </div>
);
