import { type ChartConfig } from '@platform-system/design-ui';
import { Product } from "@/types/store"

export const REVIEWS = [
  {
    id: 1,
    author: "Sarah M.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    date: "2 tuần trước",
    title: "Tuyệt đối hoàn mỹ!",
    content:
      "Chất lượng của chiếc túi này vượt quá mong đợi của tôi. Da mềm như bơ và tay nghề thủ công thật hoàn hảo. Đáng từng xu!",
    helpful: 24,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop"],
  },
  {
    id: 2,
    author: "Michael R.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    date: "1 tháng trước",
    title: "Hoàn hảo cho nhu cầu hàng ngày",
    content:
      "Tôi mua chiếc túi này tặng vợ và cô ấy cực kỳ thích. Túi đủ rộng để đựng mọi thứ cần thiết và trông rất sang trọng.",
    helpful: 18,
  },
  {
    id: 3,
    author: "Emma L.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 4,
    date: "1 tháng trước",
    title: "Chất lượng tuyệt vời, hơi nhỏ hơn mong đợi",
    content:
      "Túi đẹp với tay nghề thủ công xuất sắc. Lý do duy nhất tôi tặng 4 sao là nó nhỏ hơn một chút so với tôi tưởng tượng. Tuy nhiên vẫn rất thích!",
    helpful: 12,
  },
]

export const PRICE_HISTORY = [
  { month: "Th1", price: 399 },
  { month: "Th2", price: 385 },
  { month: "Th3", price: 399 },
  { month: "Th4", price: 350 },
  { month: "Th5", price: 320 },
  { month: "Hiện tại", price: 299 },
]

export const PRICE_CHART_CONFIG = {
  price: {
    label: "Giá",
    color: "rgb(var(--store-accent-rgb))",
  },
} satisfies ChartConfig

export const CARE_INSTRUCTIONS = {
  fashion: "Để duy trì vẻ đẹp cho sản phẩm da, hãy bảo quản trong túi chống bụi khi không sử dụng. Làm sạch bằng vải mềm và khô. Tránh tiếp xúc với nước và ánh nắng trực tiếp quá lâu.",
  home: "Vệ sinh nhẹ nhàng bằng khăn ẩm hoặc máy hút bụi cầm tay. Tránh sử dụng hóa chất tẩy rửa mạnh để bảo vệ bề mặt và màu sắc sản phẩm.",
  electronics: "Bảo quản nơi khô ráo, thoáng mát. Sử dụng bộ vệ sinh chuyên dụng cho thiết bị điện tử. Tránh va đập mạnh và tiếp xúc với chất lỏng.",
  accessories: "Bảo quản trong hộp trang sức hoặc túi mềm để tránh trầy xước. Tránh tiếp xúc với nước hoa, mỹ phẩm và hóa chất để giữ độ sáng bóng.",
}

export function getEnhancedProduct(baseProduct: Product) {
  const galleryImages = (baseProduct.images || []).filter((image) => image && image !== baseProduct.image)

  return {
    ...baseProduct,
    description:
      "Được chế tác từ loại da Ý tốt nhất, chiếc túi tote cao cấp này kết hợp vẻ đẹp sang trọng vượt thời gian với tính năng hiện đại. Hoàn hảo cho những chuyên gia tinh tế, những người coi trọng cả phong cách và chất lượng.",
    images: galleryImages.length > 0
      ? [baseProduct.image, ...galleryImages]
      : [
          baseProduct.image,
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&h=1000&fit=crop",
        ],
    seller: {
      ...baseProduct.seller,
      slug: baseProduct.seller.slug || baseProduct.seller.name.toLowerCase().replace(/\s+/g, "-"),
      avatar: baseProduct.seller.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      rating: baseProduct.seller.rating || 4.9,
      productCount: baseProduct.seller.productCount || 156,
      location: baseProduct.seller.location || "Milan, Ý",
      responseTime: "Thường phản hồi trong vòng 2 giờ",
    },
    variants: {
      colors: [
        { name: "Đen", value: "#1a1a1a" },
        { name: "Nâu", value: "#8B4513" },
        { name: "Vàng đồng", value: "#D2B48C" },
        { name: "Xanh Navy", value: "#000080" },
      ],
      sizes: ["Nhỏ", "Vừa", "Lớn"],
    },
    features: [
      "100% Da Ý cao cấp",
      "Chi tiết khâu tay tỉ mỉ",
      'Ngăn đựng laptop (vừa 15")',
      "Nhiều ngăn tiện dụng",
      "Phụ kiện kim loại mạ vàng",
      "Quai đeo vai tháo rời",
    ],
    stock: 12,
    categoryName:
      baseProduct.category === "fashion"
        ? "Túi xách"
        : baseProduct.category === "home"
          ? "Trang trí"
          : baseProduct.category === "electronics"
            ? "Điện tử"
            : "Phụ kiện",
  }
}

