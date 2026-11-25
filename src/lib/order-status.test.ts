import { describe, it, expect } from 'vitest';
import { ORDER_COPY } from './order-status';

describe('ORDER_COPY', () => {
  it('states the manual confirmation step without promising immediate delivery', () => {
    expect(ORDER_COPY.paymentConfirmed).toContain('admin will finalize');
    expect(ORDER_COPY.paymentConfirmed).not.toMatch(/unlock/i);
    expect(ORDER_COPY.awaitingReview).toContain('only after payment is confirmed');
    expect(ORDER_COPY.shortlistPending).toContain('admin finalizes');
    expect(ORDER_COPY.shortlistPending).not.toMatch(/unlock/i);
  });

  it('offers a self-service path after rejection', () => {
    expect(ORDER_COPY.orderRejected).toContain(ORDER_COPY.createNewOrder);
    expect(ORDER_COPY.rejectedTimeline).toContain(ORDER_COPY.createNewOrder);
    expect(ORDER_COPY.orderReviewRejected.toLowerCase()).toContain(
      ORDER_COPY.createNewOrder.toLowerCase()
    );
  });
});
