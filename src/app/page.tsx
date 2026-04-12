const workflow = [
  {
    title: "收集",
    description: "快速记下一条报错、一段命令或一个刚踩完的坑。",
  },
  {
    title: "整理",
    description: "把 Inbox 里的碎片补全为结构化知识卡片。",
  },
  {
    title: "搜索",
    description: "通过标题、问题、方案、标签和技术栈快速召回。",
  },
  {
    title: "复用",
    description: "在下一次遇到类似情境时直接复用过去的判断。",
  },
];

const priorities = [
  "先让 Note 模型、状态流转和搜索体验站住脚。",
  "先做 rule-based 相关推荐，不提前引入 embedding 或图数据库。",
  "让快速录入足够轻，让后续消化足够结构化。",
];

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden bg-[linear-gradient(180deg,#f7f6ef_0%,#f1ede2_40%,#ede7d9_100%)] text-slate-950">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(187,134,72,0.28),_transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),transparent)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-10 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-slate-900/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              local-first memory for developers
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[0.08em]">
              DevBrain
            </p>
          </div>
          <div className="rounded-full border border-slate-900/15 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
            MVP / v0.1
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="rounded-[2rem] border border-slate-900/10 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
              Build the core loop first
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl">
              DevBrain
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              把开发中的碎片知识沉淀成可检索、可关联、可复用的知识资产。
              当前阶段先把底层知识卡片系统做扎实，再谈图谱、AI 和自动化采集。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {workflow.map((item) => (
                <span
                  key={item.title}
                  className="rounded-full border border-slate-900/10 bg-slate-950 px-4 py-2 text-sm font-medium text-stone-50"
                >
                  {item.title}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-8 text-stone-100 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <p className="text-sm uppercase tracking-[0.32em] text-stone-400">
              当前实现优先级
            </p>
            <ol className="mt-6 space-y-4">
              {[
                "数据模型",
                "本地存储",
                "结构化编辑",
                "搜索与筛选",
                "规则版相关条目推荐",
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex items-start gap-4 border-b border-white/10 pb-4 last:border-none last:pb-0"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-stone-300">
                    {index + 1}
                  </span>
                  <span className="text-base leading-7 text-stone-100">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {workflow.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-slate-900/10 bg-white/75 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.07)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                {item.title}
              </p>
              <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-slate-950">
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[1.75rem] border border-dashed border-slate-900/20 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
              产品原则
            </p>
            <ul className="mt-5 space-y-4 text-base leading-7 text-slate-700">
              {priorities.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-slate-900/10 bg-white/70 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
              当前闭环
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-stone-100 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                  Capture
                </p>
                <p className="mt-3 text-lg font-medium leading-7 text-slate-900">
                  先把标题、原始输入和上下文存进 Inbox。
                </p>
              </div>
              <div className="rounded-2xl bg-stone-100 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                  Digest
                </p>
                <p className="mt-3 text-lg font-medium leading-7 text-slate-900">
                  补全问题、方案、原理和命令，把碎片变成资产。
                </p>
              </div>
              <div className="rounded-2xl bg-stone-100 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                  Recall
                </p>
                <p className="mt-3 text-lg font-medium leading-7 text-slate-900">
                  用关键词、标签和技术栈快速召回过去的真实经验。
                </p>
              </div>
              <div className="rounded-2xl bg-stone-100 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                  Extend Later
                </p>
                <p className="mt-3 text-lg font-medium leading-7 text-slate-900">
                  未来再叠加 embedding、知识图谱和情境召回，不推倒重来。
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
