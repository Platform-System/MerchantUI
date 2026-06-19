# Platform.MerchantUI

Merchant storefront UI built with Next.js. This app currently uses `@platform/api-client` to call the gateway at `NEXT_PUBLIC_API_URL`.

## Environment

- `NEXT_PUBLIC_API_URL`: gateway base URL for public and authenticated API calls
- `NEXT_PUBLIC_KEYCLOAK_URL`: Keycloak server URL
- `NEXT_PUBLIC_KEYCLOAK_REALM`: Keycloak realm name
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`: Keycloak client id for Merchant UI

See `.env.example` for the default local setup.

## API Map

### Public storefront

- `GET /api/catalog/categories`
  Used by category navigation, marketplace filters, and seller product forms.
  Source: `src/shared/lib/category-queries.ts`, `src/features/store/queries/store-product-manage-queries.ts`

- `GET /api/catalog/products`
  Used to build the product listing pool for home, marketplace, search, and seller/category enrichments.
  Source: `src/features/product/queries/product-queries.ts`, `src/features/seller/queries/seller-queries.ts`

- `GET /api/catalog/products/{id}`
  Used by product detail screen.
  Source: `src/features/product/queries/product-queries.ts`

- `GET /api/catalog/product-medias?productId={id}`
  Used to load gallery images for product detail.
  Source: `src/features/product/queries/product-queries.ts`

- `GET /api/store/stores`
  Used to resolve public seller cards and to enrich products with seller information.
  Source: `src/features/product/queries/product-queries.ts`, `src/features/seller/queries/seller-queries.ts`

- `GET /api/store/stores/{slug}`
  Used by seller storefront detail page.
  Source: `src/features/seller/queries/seller-queries.ts`

- `GET /api/catalog/stores/{slug}/products`
  Used by seller storefront product grid.
  Source: `src/features/seller/queries/seller-queries.ts`

### Authenticated shopper flows

- `GET /api/identity/users/me`
  Used by account profile screen.
  Source: `src/features/account/hooks/use-account.ts`

- `GET /api/ordering/orders`
  Used by account order history.
  Source: `src/features/account/hooks/use-account.ts`

- `GET /api/ordering/orders/{orderId}`
  Used by account order details screen.
  Source: `src/features/account/hooks/use-account.ts`

- `GET /api/ordering/carts`
  Used to hydrate the current cart from backend.
  Source: `src/features/cart/context/CartContext.tsx`

- `POST /api/ordering/carts/items`
  Used to add cart items.
  Source: `src/features/cart/context/CartContext.tsx`

- `PUT /api/ordering/carts/items/{id}`
  Used to update cart item quantity.
  Source: `src/features/cart/context/CartContext.tsx`

- `DELETE /api/ordering/carts/items/{id}`
  Used to remove cart items.
  Source: `src/features/cart/context/CartContext.tsx`

- `POST /api/ordering/carts/checkout`
  Used to create an order from the active cart during checkout.
  Source: `src/features/checkout/hooks/use-checkout.ts`

### Seller onboarding and store management

- `POST /api/store/manage/stores`
  Used by Become Seller flow to create a new store.
  Source: `src/features/seller/queries/seller-queries.ts`

- `GET /api/store/manage/stores/me`
  Used to load the current user's store management workspace.
  Source: `src/features/store/queries/store-manage-queries.ts`

- `PUT /api/store/manage/stores/me/profile`
  Used to update store profile information.
  Source: `src/features/store/queries/store-manage-queries.ts`

- `PUT /api/store/manage/stores/me/policy`
  Used to update shipping, return, and warranty policies.
  Source: `src/features/store/queries/store-manage-queries.ts`

- `GET /api/store/manage/stores/me/members`
  Used to load store member management.
  Source: `src/features/store/queries/store-manage-queries.ts`

- `POST /api/store/manage/stores/{storeId}/activation-requests`
  Used to submit store activation requests.
  Source: `src/features/store/queries/store-manage-queries.ts`

- `POST /api/store/manage/stores/{storeId}/members/invitations`
  Used to invite a user into a store.
  Source: `src/features/store/queries/store-manage-queries.ts`

- `POST /api/store/manage/stores/{storeId}/members/acceptance`
  Used to accept a pending store invitation.
  Source: `src/features/store/queries/store-manage-queries.ts`

- `PUT /api/store/manage/stores/me/images/{type}`
  Used to update store avatar or cover metadata after upload.
  Source: `src/features/store/queries/store-manage-queries.ts`

- `PUT /api/store/manage/stores/members/{userId}/publish-permission`
  Used to toggle direct publish permission for store members.
  Source: `src/features/store/queries/store-manage-queries.ts`

### Seller product management

- `GET /api/catalog/manage/products/me/pending`
  Used to load the current seller's draft and pending products.
  Source: `src/features/store/queries/store-product-manage-queries.ts`

- `GET /api/catalog/manage/stores/me/products/pending-owner-review`
  Used to load products waiting for owner approval.
  Source: `src/features/store/queries/store-product-manage-queries.ts`

- `POST /api/catalog/manage/products`
  Used to create a seller-managed product.
  Source: `src/features/store/queries/store-product-manage-queries.ts`

- `PUT /api/catalog/manage/products/{productId}`
  Used to update a seller-managed product.
  Source: `src/features/store/queries/store-product-manage-queries.ts`

- `DELETE /api/catalog/manage/products/{productId}`
  Used to delete a seller-managed product.
  Source: `src/features/store/queries/store-product-manage-queries.ts`

- `POST /api/catalog/manage/products/{productId}/approvals/owner`
  Used by store owners to approve member-submitted products.
  Source: `src/features/store/queries/store-product-manage-queries.ts`

## Notes

- Seller storefront now uses live store and product endpoints for listing and detail data.
- Review detail, follower count, and member-since data are not currently backed by a storefront API, so the UI avoids showing fabricated sample data for those fields.
