import { useNavigate } from 'react-router-dom';
import { BookOpen, CircleDot, CheckCheck, ToggleRight, Shuffle, ChevronRight, Sparkles } from 'lucide-react';
import type { QuizMode } from '../types';

interface ModeCard {
  mode: QuizMode;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  count: number;
  gradient: string;
  features: string[];
  isFeatured?: boolean;
}

const modeCards: ModeCard[] = [
  {
    mode: 'single',
    title: '单选题',
    subtitle: '四选一，考察基础知识掌握',
    icon: <CircleDot className="w-6 h-6" />,
    count: 20,
    gradient: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 hover:border-blue-400/60',
    features: ['20 道单选题', '随机顺序出题', '即时答案反馈'],
  },
  {
    mode: 'multiple',
    title: '多选题',
    subtitle: '多选组合，全面检验知识点',
    icon: <CheckCheck className="w-6 h-6" />,
    count: 10,
    gradient: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 hover:border-purple-400/60',
    features: ['10 道多选题', '随机顺序出题', '即时答案反馈'],
  },
  {
    mode: 'trueFalse',
    title: '判断题',
    subtitle: '是非判断，快速巩固概念理解',
    icon: <ToggleRight className="w-6 h-6" />,
    count: 20,
    gradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400/60',
    features: ['20 道判断题', '随机顺序出题', '即时答案反馈'],
  },
  {
    mode: 'mixed',
    title: '综合练习',
    subtitle: '三种题型随机混合，模拟真实考试',
    icon: <Shuffle className="w-6 h-6" />,
    count: 50,
    gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400/60',
    features: ['50 道综合题', '单选+多选+判断', '随机顺序出题', '错题重做功能'],
    isFeatured: true,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">行政组织学 · 在线题库</h1>
              <p className="text-sm text-muted-foreground">随时随地，高效刷题</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 w-full">
        {/* Welcome */}
        <div className="mb-6 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">选择练习模式</h2>
          <p className="text-muted-foreground text-sm">
            共 50 道客观题，涵盖单选、多选、判断三种题型。每题作答后即时显示正确答案，做完自动整理错题。
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid gap-4">
          {modeCards.map((card, index) => (
            <button
              key={card.mode}
              onClick={() => navigate(`/quiz/${card.mode}`)}
              className={`
                relative text-left w-full rounded-2xl border bg-card p-5
                transition-all duration-300 cursor-pointer
                hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5
                active:scale-[0.98]
                bg-gradient-to-br ${card.gradient}
                animate-slide-up
                group
              `}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {card.isFeatured && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-400">推荐</span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    bg-card border border-border
                    group-hover:border-primary/30 transition-colors
                  `}>
                    <div className="text-foreground/80 group-hover:text-primary transition-colors">
                      {card.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {card.title}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {card.count}题
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{card.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors mt-1" />
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {card.features.map((f, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/50"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 p-4 rounded-2xl bg-card/50 border border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">题库科目</span>
            <span className="font-medium">行政组织学</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">总题量</span>
            <span className="font-medium">50 道客观题</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">题型分布</span>
            <span className="font-medium">单选 20 · 多选 10 · 判断 20</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground/60">
        <p>支持桌面端 &amp; 移动端 · 可添加至手机主屏幕</p>
      </footer>
    </div>
  );
}
