import { toast } from "sonner";
import { ApiError } from "@/services";

export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  CONTRACT = "CONTRACT",
  VALIDATION = "VALIDATION",
  UNKNOWN = "UNKNOWN",
}

export interface ErrorContext {
  operation?: string;
  contractMethod?: string;
  userAction?: string;
  timestamp: number;
  principal?: string;
}

export class ContractError extends Error {
  public type: ErrorType;
  public code?: string;
  public context?: ErrorContext;
  public originalError?: unknown;
  public retryable: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    context?: ErrorContext,
    retryable: boolean = false,
    originalError?: unknown,
  ) {
    super(message);
    this.name = "ContractError";
    this.type = type;
    this.code = code;
    this.context = context;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}

export class ErrorHandler {
  private static errorLog: ContractError[] = [];
  private static maxLogSize = 100;

  static logError(error: ContractError) {
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console for debugging
    console.error("[ContractError]", {
      message: error.message,
      type: error.type,
      code: error.code,
      context: error.context,
      originalError: error.originalError,
    });
  }

  static getRecentErrors(count: number = 10): ContractError[] {
    return this.errorLog.slice(0, count);
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static createError(
    error: unknown,
    operation?: string,
    contractMethod?: string,
    userAction?: string,
    principal?: string,
  ): ContractError {
    const context: ErrorContext = {
      operation,
      contractMethod,
      userAction,
      timestamp: Date.now(),
      principal,
    };

    // Handle ApiError from services
    if (error instanceof ApiError) {
      const contractError = new ContractError(
        error.message,
        this.categorizeError(error.message, error.code),
        error.code,
        context,
        this.isRetryable(error.code),
        error,
      );
      this.logError(contractError);
      return contractError;
    }

    // Handle network errors
    if (error instanceof Error) {
      if (
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("timeout")
      ) {
        const contractError = new ContractError(
          "Network connection failed. Please check your internet connection.",
          ErrorType.NETWORK,
          "NETWORK_ERROR",
          context,
          true,
          error,
        );
        this.logError(contractError);
        return contractError;
      }

      if (
        error.message.includes("identity") ||
        error.message.includes("authentication") ||
        error.message.includes("login")
      ) {
        const contractError = new ContractError(
          "Authentication failed. Please log in again.",
          ErrorType.AUTHENTICATION,
          "AUTH_ERROR",
          context,
          false,
          error,
        );
        this.logError(contractError);
        return contractError;
      }

      const contractError = new ContractError(
        error.message,
        ErrorType.UNKNOWN,
        undefined,
        context,
        false,
        error,
      );
      this.logError(contractError);
      return contractError;
    }

    // Handle unknown errors
    const contractError = new ContractError(
      "An unexpected error occurred. Please try again.",
      ErrorType.UNKNOWN,
      undefined,
      context,
      true,
      error,
    );
    this.logError(contractError);
    return contractError;
  }

  private static categorizeError(message: string, code?: string): ErrorType {
    const lowerMessage = message.toLowerCase();

    if (
      code?.includes("AUTH") ||
      lowerMessage.includes("authentication") ||
      lowerMessage.includes("identity")
    ) {
      return ErrorType.AUTHENTICATION;
    }

    if (
      code?.includes("PERMISSION") ||
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("forbidden")
    ) {
      return ErrorType.AUTHORIZATION;
    }

    if (
      lowerMessage.includes("network") ||
      lowerMessage.includes("fetch") ||
      lowerMessage.includes("timeout")
    ) {
      return ErrorType.NETWORK;
    }

    if (
      lowerMessage.includes("invalid") ||
      lowerMessage.includes("validation") ||
      lowerMessage.includes("format")
    ) {
      return ErrorType.VALIDATION;
    }

    if (
      code?.includes("CONTRACT") ||
      lowerMessage.includes("canister") ||
      lowerMessage.includes("contract")
    ) {
      return ErrorType.CONTRACT;
    }

    return ErrorType.UNKNOWN;
  }

  private static isRetryable(code?: string): boolean {
    const retryableCodes = [
      "NETWORK_ERROR",
      "TIMEOUT",
      "TEMPORARILY_UNAVAILABLE",
      "429",
    ];
    return retryableCodes.some((retryableCode) =>
      code?.includes(retryableCode),
    );
  }

  static handleError(
    error: unknown,
    showToast: boolean = true,
    operation?: string,
    contractMethod?: string,
    userAction?: string,
    principal?: string,
  ): ContractError {
    const contractError = this.createError(
      error,
      operation,
      contractMethod,
      userAction,
      principal,
    );

    if (showToast) {
      this.showErrorToast(contractError);
    }

    return contractError;
  }

  private static showErrorToast(error: ContractError): void {
    const toastOptions = {
      duration: error.type === ErrorType.NETWORK ? 4000 : 3000,
      id: `error-${error.type}-${Date.now()}`, // Prevent duplicate toasts
    };

    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        toast.error("Please log in to continue", toastOptions);
        break;
      case ErrorType.AUTHORIZATION:
        toast.error(
          "You don't have permission to perform this action",
          toastOptions,
        );
        break;
      case ErrorType.NETWORK:
        toast.error("Connection issue. Retrying...", toastOptions);
        break;
      case ErrorType.VALIDATION:
        toast.error(`Invalid input: ${error.message}`, toastOptions);
        break;
      case ErrorType.CONTRACT:
        toast.error(`Contract error: ${error.message}`, toastOptions);
        break;
      default:
        toast.error(error.message, toastOptions);
    }
  }

  static getErrorSuggestion(error: ContractError): string {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        return "Try logging out and logging back in.";
      case ErrorType.AUTHORIZATION:
        return "Make sure you have the required permissions.";
      case ErrorType.NETWORK:
        return "Check your internet connection and try again.";
      case ErrorType.VALIDATION:
        return "Please check your input and correct any errors.";
      case ErrorType.CONTRACT:
        return "The operation failed on the blockchain. Please try again.";
      default:
        return "If the problem persists, please contact support.";
    }
  }
}

// Error boundary helper for React components
export function withErrorHandler<T extends (...args: any[]) => any>(
  fn: T,
  operation?: string,
  contractMethod?: string,
  userAction?: string,
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          ErrorHandler.handleError(
            error,
            true,
            operation,
            contractMethod,
            userAction,
          );
          throw error;
        });
      }

      return result;
    } catch (error) {
      ErrorHandler.handleError(
        error,
        true,
        operation,
        contractMethod,
        userAction,
      );
      throw error;
    }
  }) as T;
}

// Hook for error reporting and analytics
export function useErrorReporting() {
  const reportError = (
    error: ContractError,
    additionalContext?: Record<string, any>,
  ) => {
    // Here you could send to analytics service, Sentry, etc.
    console.log("Reporting error:", {
      ...error,
      additionalContext,
    });

    // Example: Send to analytics
    // analytics.track('error_occurred', {
    //     error_type: error.type,
    //     error_code: error.code,
    //     operation: error.context?.operation,
    //     contract_method: error.context?.contractMethod,
    //     user_action: error.context?.userAction,
    //     ...additionalContext,
    // });
  };

  const getErrorStats = () => {
    const errors = ErrorHandler.getRecentErrors(50);
    const byType = errors.reduce(
      (acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      },
      {} as Record<ErrorType, number>,
    );

    return {
      total: errors.length,
      byType,
      recent: errors.slice(0, 5),
    };
  };

  return {
    reportError,
    getErrorStats,
    clearErrors: ErrorHandler.clearErrorLog,
  };
}
