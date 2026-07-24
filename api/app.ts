/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import analyzeRoutes from './routes/analyze.js'
import analyzeSgfRoutes from './routes/analyze-sgf.js'
import analyzeImageRoutes from './routes/analyze-image.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

/**
 * API Routes
 */
app.use('/api/analyze', analyzeRoutes)
app.use('/api/analyze-sgf', analyzeSgfRoutes)
app.use('/api/analyze-image', analyzeImageRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * 静态文件服务（前端 dist）
 */
app.use(express.static(path.join(__dirname, '../dist')))

/**
 * SPA 路由回退
 */
app.get('/*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[server] error:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

export default app
