/**
 * Shared copy for manual shortlist-order states.
 * Keeps server-action results and founder-facing status text aligned.
 */
export const ORDER_COPY = {
  paymentConfirmed: 'Payment confirmed. An admin will finalize your shortlist.',
  awaitingReview:
    'An admin is confirming your payment. The shortlist is finalized only after payment is confirmed.',
  shortlistPending:
    'Payment confirmed. Your ranked shortlist will appear here once an admin finalizes it.',
  orderRejected: 'This order was rejected. Create a new order to try again.',
  rejectedTimeline: 'This payment was not confirmed. Create a new order to try again.',
  createNewOrder: 'Create a new order',
  orderReviewRejected: 'Order rejected. The founder can create a new order.',
} as const;
