import { apiClient } from "@/shared/api/api-client"
import type { Result, PagedResult } from "@/types/api"

export interface WalletResponse {
  id: string
  userId: string
  balance: number
}

export interface WalletTransactionResponse {
  id: string
  walletId: string
  type: number // 1 = Topup, 2 = Payment, 3 = Refund
  status: number // 1 = Pending, 2 = Succeeded, 3 = Failed
  amount: number
  balanceAfter: number
  currency: string
  referenceType: string
  referenceId: string
  referenceCode: number
  description: string
  createdAt: string
}

export interface WalletTopupRequest {
  amount: number
  provider?: string
}

export interface WalletTopupResponse {
  walletId: string
  transactionId: string
  referenceCode: number
  amount: number
  currency: string
  provider: string
  checkoutUrl: string
  paymentLinkId: string
}

export interface CheckoutOrderRequest {
  paymentMethod: string
  provider?: string
}

export interface WalletStatementResponse {
  walletId: string
  userId: string
  currentBalance: number
  openingBalance: number
  closingBalance: number
  totalTopup: number
  totalPayment: number
  netChange: number
  succeededTransactionCount: number
  pendingTransactionCount: number
  failedTransactionCount: number
  createdAtFrom?: string
  createdAtTo?: string
}

export interface WalletStatementRequest {
  createdAtFrom?: string
  createdAtTo?: string
}

export const walletQueryKeys = {
  me: ["wallet", "me"] as const,
  transactions: ["wallet", "transactions"] as const,
  statement: (params: WalletStatementRequest) => ["wallet", "statement", params] as const,
}

export async function fetchMyWallet(): Promise<WalletResponse | null> {
  const maxRetries = 5
  const delayMs = 1000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiClient.get<Result<WalletResponse>>("/api/wallet/me")
      if (response.data?.success && response.data.data) {
        return response.data.data
      }
      return null
    } catch (error) {
      const err = error as { response?: { status?: number } }
      const status = err.response?.status
      if (status === 404 && attempt < maxRetries) {
        console.log(`[fetchMyWallet] Wallet not found (404). Retrying in ${delayMs}ms... (Attempt ${attempt}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        continue
      }
      console.error("Loi khi lay thong tin vi:", error)
      return null
    }
  }
  return null
}

export async function fetchMyWalletTransactions(
  page = 1,
  pageSize = 20
): Promise<PagedResult<WalletTransactionResponse>> {
  try {
    const response = await apiClient.get<Result<PagedResult<WalletTransactionResponse>>>(
      "/api/wallet/me/transactions",
      {
        params: {
          page,
          pageSize,
        },
      }
    )
    return response.data?.data ?? { items: [], totalCount: 0, page, pageSize }
  } catch (error) {
    console.error("Loi khi lay giao dich vi:", error)
    return { items: [], totalCount: 0, page, pageSize }
  }
}

export async function createWalletTopup(request: WalletTopupRequest): Promise<WalletTopupResponse | null> {
  const response = await apiClient.post<Result<WalletTopupResponse>>("/api/wallet/me/topups", {
    amount: request.amount,
    provider: request.provider || "PayOS",
  })
  return response.data?.data ?? null
}

export async function payOrderWithWallet(orderCode: number | string): Promise<Result<unknown>> {
  const response = await apiClient.post<Result<unknown>>(`/api/ordering/orders/${orderCode}/checkout`, {
    paymentMethod: "wallet",
  })
  return response.data
}

export async function fetchMyWalletStatement(
  params: WalletStatementRequest = {}
): Promise<WalletStatementResponse | null> {
  try {
    const response = await apiClient.get<Result<WalletStatementResponse>>("/api/wallet/me/statement", {
      params,
    })
    if (response.data?.success && response.data.data) {
      return response.data.data
    }
    return null
  } catch (error) {
    console.error("Loi khi lay sao ke vi:", error)
    return null
  }
}
