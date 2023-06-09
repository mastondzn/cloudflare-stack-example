import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';

const queryClient = new QueryClient();

const theme = extendTheme({
    config: { initialColorMode: 'dark', useSystemColorMode: false },
});

createRoot(document.querySelector('#root') as HTMLElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
                <App />
            </ChakraProvider>
        </QueryClientProvider>
    </StrictMode>
);
