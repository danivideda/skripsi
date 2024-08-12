'use client';

import { useState, ReactNode, createContext } from 'react';
import { AggregatedTransactionContextType, AggregatedTransactionDetail } from '../types';
export const AggregatedTransactionContext = createContext<AggregatedTransactionContextType>({
  aggregatedTransactionDetail: null,
  setAggregatedTransactionDetail: () => {},
});

export default function AggregatedTransactionProvider({ children }: { children: ReactNode }) {
  const [aggregatedTransactionDetail, setAggregatedTransactionDetail] =
    useState<AggregatedTransactionDetail | null>(null);

  return (
    <AggregatedTransactionContext.Provider
      value={{ aggregatedTransactionDetail, setAggregatedTransactionDetail }}
    >
      {children}
    </AggregatedTransactionContext.Provider>
  );
}
