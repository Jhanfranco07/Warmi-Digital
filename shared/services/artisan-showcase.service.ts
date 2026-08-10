import { ProductRepository } from "@/shared/repositories/product.repository";
import { OrderRepository } from "@/shared/repositories/order.repository";

export class ArtisanShowcaseService {
  constructor(
    private readonly productRepository = new ProductRepository(),
    private readonly orderRepository = new OrderRepository()
  ) {}

  async getShowcase(userId: string) {
    const [products, orders] = await Promise.all([
      this.productRepository.findByArtisan(userId),
      this.orderRepository.findRecentForArtisan(userId, 10)
    ]);

    return { products, orders };
  }
}
