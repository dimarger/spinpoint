import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { MotionConfig } from 'motion/react';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import './styles/index.css';
const Catalog = lazy(() => import('./pages/Catalog'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));
const Builder = lazy(() => import('./pages/Builder'));
const Info = lazy(() => import('./pages/Info'));
const Wholesale = lazy(() => import('./pages/Wholesale'));
const CatalogEditor = lazy(() => import('./pages/CatalogEditor'));
const NotFound = lazy(() => import('./pages/NotFound'));
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <HashRouter>
          <Suspense
            fallback={
              <div
                className="container skeleton-page"
                role="status"
                aria-label="Завантаження сторінки"
              >
                <div />
                <div />
                <div />
              </div>
            }
          >
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="catalog" element={<Catalog />} />
                <Route path="product/:id" element={<Product />} />
                <Route path="cart" element={<Cart />} />
                <Route path="favorites" element={<Catalog favorites />} />
                <Route path="builder" element={<Builder />} />
                <Route path="wholesale" element={<Wholesale />} />
                <Route path="info/:slug" element={<Info />} />
                <Route path="catalog-editor" element={<CatalogEditor />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </HashRouter>
        <Toaster position="bottom-right" richColors closeButton />
      </MotionConfig>
    </ErrorBoundary>
  </StrictMode>
);
