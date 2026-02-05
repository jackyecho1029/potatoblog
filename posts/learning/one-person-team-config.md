# 技术指南：如何配置你的 Claude Code “单人团队” 架构

要实现 Allie Miller 提到的“并行、嵌套、叠加”的工作流，核心在于打破“一个窗口一个 AI”的思维。我们将通过 **Git Worktrees** 和 **CLAUDE.md** 构建一个多实体的协作环境。

---

### 第一步：开启“并行分身” (Git Worktree)

如果你在一个分支上让 AI 写代码，你自己就没法动了。解决方法是使用 Git 的“分身术”。

1.  **在主项目目录运行：**
    ```bash
    # 创建一个新的独立工作空间（指向另一个分支）
    git worktree add ../parallel-fix-ui feature/fix-ui
    ```
2.  **多开终端：**
    - 在窗口 A（主目录）运行 `claude`：让它处理后端逻辑。
    - 在窗口 B (`../parallel-fix-ui`) 运行 `claude`：让它处理 UI 修复。
    - **效果**：两个 AI 实例在物理隔离的环境下同时跑跑测试、写代码，互不干扰。

---

### 第二步：配置“团队大脑” (CLAUDE.md)

为了让每个分身都知道“它是谁”以及“该怎么干活”，你需要在一个项目根目录创建 `CLAUDE.md`。

**推荐配置模板：**
```markdown
# Team Role: Senior Full-Stack Engineer

## Project Logic
- Tech Stack: Next.js, TypeScript, Tailwind
- Style Guide: [dontbesilent] style (Cold logic, high aesthetic)

## Team Workflow (Agentic Patterns)
1. **Plan First**: Always use `plan` mode before writing code.
2. **Parallel Thinking**: If task A depends on task B, stop and ask the user to spawn a Worktree for task B.
3. **Stacked Review**: Before finishing, run a self-security-check scan.

## Commands
- Test: `npm test`
- Build: `npm run build`
- Deploy: `git push origin main`
```

---

### 第三步：使用“嵌套与复合”指令

在 Claude Code 终端中，不要只下达简单指令。试着使用**结构化指令**：

**复合指令示例：**
> "Claude，分析当前目录下的文章风格。**[第一步]** 生成 3 个推文草稿。**[第二步]** 将结果写入 `drafts/` 文件夹。**[第三步]** 自动运行 `git add` 并准备提交备注。"

---

### 第四步：启用“全能外挂” (MCP)

通过 Model Context Protocol (MCP) 让 Claude 拥有“手”。
1. 运行 `claude mcp add`。
2. 添加 **Google Calendar** (安排会议)、**GitHub** (管理 Issue)、**Web Search** (查资料)。
3. **效果**：你可以对它说：“去查一下最新的 X 趋势，根据趋势写篇博客，并帮我在日历上预约明早 10 点的发布提醒。”

---

### 总结：你的新身份

配置完这些，你就不再是一个“写代码的人”，你是一个 **AI 调度员 (AI Dispatcher)**。

- 你负责：定义 SOP、分发 Worktree 任务、最终审核。
- AI 负责：并行执行、自我修复、工具调用。

**Ready to start? 建议先从第一个 `git worktree` 开始试一试。**
