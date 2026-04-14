import {
  createLoader,
  createSearchParamsCache,
  createSerializer,
  parseAsString,
} from 'nuqs/server';

export const productSearchParamsParsers = {
  q: parseAsString.withOptions({ throttleMs: 400 }),
  category: parseAsString,
};

export const productSearchParamsCache = createSearchParamsCache(
  productSearchParamsParsers,
);

export const loadProductSearchParams = createLoader(productSearchParamsParsers);

export const serializeProductSearchUrl = createSerializer(
  productSearchParamsParsers,
);
