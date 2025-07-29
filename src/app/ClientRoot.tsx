'use client';

import { ReactNode } from 'react';
import BackButton from '@/components/BackButton';
import ClientLayout from '@/components/ClientLayouts';
import { Provider } from 'react-redux';
import store from '@/redux/store';

export default function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <ClientLayout>
      <BackButton />
      <Provider store={store}>
        <main>{children}</main>
      </Provider>
    </ClientLayout>
  );
}
