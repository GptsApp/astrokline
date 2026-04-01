import { respData, respErr } from '@/shared/lib/resp';
import { getUserInfo } from '@/shared/models/user';
import { findOrderByOrderNo } from '@/shared/models/order';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNo = searchParams.get('order_no');

    if (!orderNo) {
      return respErr('order_no is required');
    }

    const user = await getUserInfo(req);
    if (!user?.id) {
      return respErr('not authenticated');
    }

    const order = await findOrderByOrderNo(orderNo);
    if (!order) {
      return respErr('order not found');
    }

    // Security: only allow user to check their own orders
    if (order.userId !== user.id) {
      return respErr('not authorized');
    }

    return respData({
      status: order.status,
      productId: order.productId,
    });
  } catch (e: any) {
    return respErr(e.message || 'Failed to check status');
  }
}
