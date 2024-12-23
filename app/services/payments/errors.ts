// Note from Base-kit

// Here you can declare any custom errors that you want to use in your application.
// This is handy if you want to identify errors better in your observability tools
// or if you want to reuse a specific error message format in multiple places

export class SubscriptionNotFoundError extends Error {
  constructor(id: string) {
    super(`Subscription with ID ${id} not found`);
  }
}
