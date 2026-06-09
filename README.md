# 情人节粒子编排器

Valentine Particle Choreographer - 为餐厅情人节场景打造的专业粒子特效编排工具

## ✨ 功能特性

- **5 种发射器模板**：玫瑰瓣飘落、金粉闪烁、心形光点、萤火虫、星光雨
- **可视化时间轴编辑**：拖拽调整粒子效果的起止时间，多轨道编排
- **实时 WebGL 预览**：基于 Three.js + 自定义 Shader 的高性能粒子渲染
- **丰富参数调节**：密度、风速、风向、大小、颜色、发光强度等
- **播放控制**：播放/暂停、进度条拖拽、循环播放、倍速播放
- **JSON 导入导出**：配置文件标准化，方便现场循环播放
- **纯播放模式**：`/player` 路径，适用于现场展示
- **Docker 一键部署**：docker-compose 快速启动预览站

## 🚀 快速开始

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### Docker 部署

```bash
# 构建并启动
docker-compose up -d --build

# 访问
# 编辑器: http://localhost:8080
# 播放器: http://localhost:8080/player

# 停止服务
docker-compose down
```

## 🎮 使用说明

### 编辑器 (`/`)

1. **添加发射器**：从左侧模板库拖拽任意模板到时间轴轨道上
2. **调整时间**：拖拽发射器左右边缘调整时长，拖拽中间移动位置
3. **调节参数**：选中发射器后，在右侧属性面板调整各项参数
4. **预览效果**：点击播放按钮实时预览粒子效果
5. **导出配置**：点击导出按钮下载 JSON 配置文件

### 播放器 (`/player`)

- 自动循环播放默认示例（45 秒演示）
- 支持加载自定义 JSON 配置文件
- 移动鼠标显示控制栏，3 秒后自动隐藏
- 按 F11 进入全屏模式用于现场展示

## 📋 Schema 说明

### 项目配置 (ParticleProject)

```json
{
  "version": "1.0.0",
  "duration": 45,
  "emitters": [
    {
      "id": "emitter-xxx",
      "type": "rose-petal",
      "name": "玫瑰瓣飘落",
      "startTime": 0,
      "endTime": 45,
      "track": 0,
      "config": {
        "density": 200,
        "windSpeed": 0.5,
        "windDirection": 45,
        "size": 1.2,
        "color": "#e8b4b8",
        "opacity": 0.9,
        "speed": 1.5,
        "spread": 8,
        "glow": 0.3,
        "rotationSpeed": 1.0
      }
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | 配置文件版本号 |
| `duration` | number | 总时长（秒） |
| `emitters` | array | 发射器数组 |
| `emitters[].id` | string | 发射器唯一标识 |
| `emitters[].type` | string | 发射器类型（见下方） |
| `emitters[].name` | string | 发射器名称 |
| `emitters[].startTime` | number | 开始时间（秒） |
| `emitters[].endTime` | number | 结束时间（秒） |
| `emitters[].track` | number | 轨道编号（0-5） |
| `emitters[].config` | object | 粒子配置 |

### 发射器类型 (EmitterType)

| 类型值 | 名称 | 描述 |
|--------|------|------|
| `rose-petal` | 玫瑰瓣飘落 | 浪漫的玫瑰花瓣从空中缓缓飘落 |
| `gold-dust` | 金粉闪烁 | 金色粉末在空中飘动闪烁 |
| `heart-glow` | 心形光点 | 发光的心形粒子缓缓上升 |
| `firefly` | 萤火虫 | 温暖的萤火虫光点在空中飞舞 |
| `star-rain` | 星光雨 | 星光点点从夜空坠落 |

### 粒子配置 (EmitterConfig)

| 字段 | 类型 | 默认范围 | 说明 |
|------|------|----------|------|
| `density` | number | 10-1000 | 粒子密度（每秒发射数量） |
| `windSpeed` | number | -5 - 5 | 风速 |
| `windDirection` | number | 0-360 | 风向（度） |
| `size` | number | 0.1-5 | 粒子大小 |
| `color` | string | - | 主颜色（十六进制） |
| `opacity` | number | 0.1-1 | 不透明度 |
| `speed` | number | 0.1-10 | 运动速度 |
| `spread` | number | 1-20 | 扩散范围（米） |
| `glow` | number | 0-2 | 发光强度 |
| `rotationSpeed` | number | 0-3 | 旋转速度 |

## 🎬 45 秒示例脚本

项目内置了一个 45 秒的情人节演示效果，包含 5 种粒子效果的精心编排：

| 时间 | 效果 | 说明 |
|------|------|------|
| 0:00 - 0:45 | 🌹 玫瑰瓣飘落 | 全程基础氛围 |
| 0:05 - 0:40 | ✨ 金粉闪烁 | 金色点缀 |
| 0:10 - 0:35 | 💖 心形光点 | 浪漫高潮 |
| 0:15 - 0:45 | 🪲 萤火虫 | 温暖氛围 |
| 0:30 - 0:45 | ⭐ 星光雨 | 结尾升华 |

示例配置文件位于 `src/templates/demoProject.ts`，也可以通过编辑器中的「重置」按钮恢复。

### 使用示例配置启动播放器

```bash
# 直接访问播放器页面
# http://localhost:8080/player

# 或者在编辑器中点击播放按钮预览
# http://localhost:8080
```

### 自定义 45 秒脚本

你可以基于以下模板创建自己的 45 秒脚本：

```json
{
  "version": "1.0.0",
  "duration": 45,
  "emitters": [
    {
      "id": "bg-rose",
      "type": "rose-petal",
      "name": "背景玫瑰瓣",
      "startTime": 0,
      "endTime": 45,
      "track": 0,
      "config": {
        "density": 100,
        "windSpeed": 0.3,
        "windDirection": 60,
        "size": 1.0,
        "color": "#f8c8dc",
        "opacity": 0.7,
        "speed": 1.0,
        "spread": 12,
        "glow": 0.2,
        "rotationSpeed": 0.8
      }
    }
  ]
}
```

## 🏗️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS 3
- **状态管理**: Zustand
- **3D 渲染**: Three.js + 自定义 Shader (WebGL)
- **部署**: Nginx + Docker Compose

## 📁 项目结构

```
src/
├── components/
│   ├── ParticleCanvas/    # 粒子画布（Three.js 渲染）
│   ├── Timeline/          # 时间轴编辑器
│   ├── TemplateLibrary/   # 发射器模板库
│   ├── PropertyPanel/     # 属性面板
│   └── PlaybackControls/  # 播放控制
├── pages/
│   ├── Editor.tsx         # 编辑器页面
│   └── Player.tsx         # 播放器页面
├── store/
│   └── useEditorStore.ts  # Zustand 状态管理
├── templates/
│   ├── emitters.ts        # 发射器模板定义
│   └── demoProject.ts     # 45 秒演示项目
├── types/
│   └── particle.ts        # 类型定义
├── utils/
│   └── particleEngine.ts  # 粒子系统引擎
├── App.tsx
├── main.tsx
└── index.css
```

## 🎨 设计理念

采用深色奢华风格设计，营造浪漫夜晚氛围：
- **主色调**：深酒红 + 金色点缀 + 玫瑰粉
- **整体氛围**：如同歌剧院后台控制面板，专业而浪漫
- **交互体验**：流畅的拖拽、实时的预览、精细的参数调节

## 📝 License

MIT License
