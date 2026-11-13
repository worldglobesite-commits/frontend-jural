import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchGoods } from './api';

const initialAsync = { items: [], status: 'idle', error: null };

const initialState = {
  number: '',
  brand: null,
  brands: initialAsync,
  offers: initialAsync,
  brandsRequestId: null,
  offersRequestId: null,
};

export const searchBrands = createAsyncThunk('parts/searchBrands', async (number, { rejectWithValue, signal }) => {
  try {
    const goods = await fetchGoods({ number, signal });
    // Один элемент на производителя
    return [...new Map(goods.map((g) => [g.brand, g])).values()];
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const searchOffers = createAsyncThunk(
  'parts/searchOffers',
  async ({ number, brand }, { rejectWithValue, signal }) => {
    try {
      const goods = await fetchGoods({ number, brand, signal });
      // Искомая деталь + её аналоги
      return goods.flatMap((g) => [{ ...g, analogues: undefined, isOriginal: true }, ...(g.analogues || [])]);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    // Сбрасывает поиск; requestId обнуляются, поэтому ответы запросов в полёте игнорируются
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBrands.pending, (state, { meta }) => {
        state.number = meta.arg;
        state.brand = null;
        state.brandsRequestId = meta.requestId;
        state.brands = { items: [], status: 'loading', error: null };
        state.offers = initialAsync;
        state.offersRequestId = null;
      })
      .addCase(searchBrands.fulfilled, (state, { meta, payload }) => {
        if (meta.requestId !== state.brandsRequestId) return;
        state.brands = { items: payload, status: 'succeeded', error: null };
      })
      .addCase(searchBrands.rejected, (state, { meta, payload, error }) => {
        if (meta.requestId !== state.brandsRequestId) return;
        state.brands = { items: [], status: 'failed', error: payload || error.message };
      })
      .addCase(searchOffers.pending, (state, { meta }) => {
        state.brand = meta.arg.brand;
        state.offersRequestId = meta.requestId;
        state.offers = { items: [], status: 'loading', error: null };
      })
      .addCase(searchOffers.fulfilled, (state, { meta, payload }) => {
        if (meta.requestId !== state.offersRequestId) return;
        state.offers = { items: payload, status: 'succeeded', error: null };
      })
      .addCase(searchOffers.rejected, (state, { meta, payload, error }) => {
        if (meta.requestId !== state.offersRequestId) return;
        state.offers = { items: [], status: 'failed', error: payload || error.message };
      });
  },
});

export const { reset } = partsSlice.actions;

export const makeStore = () => configureStore({ reducer: { parts: partsSlice.reducer } });

export const store = makeStore();
