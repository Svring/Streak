import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Scrip, scripSerializer } from '../../models/scrip'
import Database from '@tauri-apps/plugin-sql'

// Async thunks
export const initializeDatabase = createAsyncThunk(
  'scrip/initializeDatabase',
  async () => {
    const db = await Database.load('sqlite:main.db')

    await db.execute(`
      CREATE TABLE IF NOT EXISTS scrips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        time_span TEXT NOT NULL,
        streak TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // After initializing database, fetch initial scrips
    const result = await db.select<any[]>('SELECT * FROM scrips ORDER BY id DESC')
    return result.map(row => scripSerializer.fromRow(row))
  }
)

export const createScripInDb = createAsyncThunk(
  'scrip/createScripInDb',
  async (scrip: Scrip) => {
    const db = await Database.load('sqlite:main.db')
    const rowData = scripSerializer.toRow(scrip)
    await db.execute(
      'INSERT INTO scrips (name, description, type, time_span, streak, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        rowData.name,
        rowData.description,
        rowData.type,
        rowData.time_span,
        rowData.streak,
        rowData.created_at
      ]
    )
    // Fetch and return all scrips after creating new one
    const result = await db.select<any[]>('SELECT * FROM scrips ORDER BY id DESC')
    return result.map(row => scripSerializer.fromRow(row))
  }
)

export const updateScripInDb = createAsyncThunk(
  'scrip/updateScripInDb',
  async (scrip: Scrip) => {
    const db = await Database.load('sqlite:main.db')
    const rowData = scripSerializer.toRow(scrip)
    await db.execute(
      'UPDATE scrips SET name = $1, description = $2, type = $3, time_span = $4, streak = $5, created_at = $6 WHERE id = $7',
      [
        rowData.name,
        rowData.description,
        rowData.type,
        rowData.time_span,
        rowData.streak,
        rowData.created_at,
        scrip.id
      ]
    )
    // Fetch and return all scrips after updating
    const result = await db.select<any[]>('SELECT * FROM scrips ORDER BY id DESC')
    return result.map(row => scripSerializer.fromRow(row))
  }
)

export const deleteScripInDb = createAsyncThunk(
  'scrip/deleteScripInDb',
  async (id: number) => {
    const db = await Database.load('sqlite:main.db')
    await db.execute('DELETE FROM scrips WHERE id = $1', [id])
    // Fetch and return all scrips after deleting
    const result = await db.select<any[]>('SELECT * FROM scrips ORDER BY id DESC')
    return result.map(row => scripSerializer.fromRow(row))
  }
)

// Define the TS type for the scrip slice's state
export interface ScripState {
  scrips: Scrip[]
  selectedScripId: number | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: ScripState = {
  scrips: [],
  selectedScripId: null,
  status: 'idle',
  error: null
}

export const scripSlice = createSlice({
  name: 'scrip',
  initialState,
  reducers: {
    setSelectedScrip: (state, action: PayloadAction<number | null>) => {
      state.selectedScripId = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize Database
      .addCase(initializeDatabase.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(initializeDatabase.fulfilled, (state, action) => {
        state.status = 'idle'
        state.scrips = action.payload // Set initial scrips after database initialization
      })
      .addCase(initializeDatabase.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || null
      })
      // Create Scrip
      .addCase(createScripInDb.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createScripInDb.fulfilled, (state, action) => {
        state.status = 'idle'
        state.scrips = action.payload
      })
      .addCase(createScripInDb.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || null
      })
      // Update Scrip
      .addCase(updateScripInDb.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateScripInDb.fulfilled, (state, action) => {
        state.status = 'idle'
        state.scrips = action.payload
      })
      .addCase(updateScripInDb.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || null
      })
      // Delete Scrip
      .addCase(deleteScripInDb.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteScripInDb.fulfilled, (state, action) => {
        state.status = 'idle'
        state.scrips = action.payload
      })
      .addCase(deleteScripInDb.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || null
      })
  }
})

export const {
  setSelectedScrip
} = scripSlice.actions

// Selectors
export const selectAllScrips = (state: { scrip: ScripState }) => state.scrip.scrips
export const selectSelectedScrip = (state: { scrip: ScripState }) => {
  return state.scrip.scrips.find(scrip => scrip.id === state.scrip.selectedScripId) || null
}
export const selectScripById = (state: { scrip: ScripState }, scripId: number) => {
  return state.scrip.scrips.find(scrip => scrip.id === scripId) || null
}
export const selectScripStatus = (state: { scrip: ScripState }) => state.scrip.status
export const selectScripError = (state: { scrip: ScripState }) => state.scrip.error

export default scripSlice.reducer