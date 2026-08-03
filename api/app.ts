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
import scenariosRoutes from './routes/scenarios.js'
import eventsRoutes from './routes/events.js'
import statsRoutes from './routes/stats.js'
import { logAccess } from './lib/db.js'
import { createRateLimit, cleanupRateLimitBuckets } from './lib/rateLimit.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

// 信任代理层（Nginx），使 req.ip 能正确反映真实客户端地址
app.set('trust proxy', true)

app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// 全局写操作限流：每 IP 每分钟 10 次
const globalRateLimit = createRateLimit({ maxRequests: 10, windowMs: 60_000 })
app.use(globalRateLimit)

// 每 5 分钟清理一次过期限流桶
setInterval(() => cleanupRateLimitBuckets(), 5 * 60_000)

// HTTP 访问日志中间件
app.use((req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now()
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    ''
  const userAgent = req.headers['user-agent'] as string | undefined
  const referer = req.headers['referer'] as string | undefined

  res.on('finish', () => {
    try {
      logAccess({
        ip: clientIp,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        userAgent,
        referer,
        responseTimeMs: Date.now() - start,
      })
    } catch (err) {
      console.error('[access-log] error:', err)
    }
  })

  next()
})

/**
 * API Routes
 */
app.use('/api/analyze', analyzeRoutes)
app.use('/api/analyze-sgf', analyzeSgfRoutes)
app.use('/api/analyze-image', analyzeImageRoutes)
app.use('/api/scenarios', scenariosRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/stats', statsRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (_req: Request, res: Response, _next: NextFunction): void => {
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
app.get('/*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

/**
 * error handler middleware
 */
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server] error:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

export default app
