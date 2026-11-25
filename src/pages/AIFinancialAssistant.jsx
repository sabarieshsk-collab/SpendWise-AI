import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  RotateCcw,
  Wifi,
  WifiOff,
  Cpu,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { MarkdownRenderer } from '../components/common/MarkdownRenderer'
import { useFinance } from '../context'
import {
  processFinancialQuery,
  checkBackendHealth,
  SUGGESTED_QUESTIONS,
} from '../services/aiService'

const INITIAL_WELCOME_MESSAGE = {
  id: 'msg-welcome',
  sender: 'assistant',
  text: "Hello! I'm your SpendWise AI financial assistant. I can help you understand your spending, monitor budgets, track savings goals and review your financial commitments. What would you like to know?",
  timestamp: 'Just now',
  category: 'Welcome',
  model: 'Live AI Co-Pilot',
}

export const AIFinancialAssistant = () => {
  const financeContext = useFinance()
  const { metrics, activePeriod, showToast } = financeContext

  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState(null)
  const [backendStatus, setBackendStatus] = useState({ checked: false, online: false, aiConfigured: false })
  const [lastFailedQuery, setLastFailedQuery] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Verify backend health and configuration on component mount
  useEffect(() => {
    let isMounted = true
    const checkStatus = async () => {
      const status = await checkBackendHealth()
      if (isMounted) {
        setBackendStatus({
          checked: true,
          online: status.ok,
          aiConfigured: Boolean(status.aiConfigured),
        })
      }
    }
    checkStatus()
    return () => {
      isMounted = false
    }
  }, [])

  // Auto-scroll chat to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Handle message submission
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim()
    if (!query || isTyping) return

    const userMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)
    setLastFailedQuery(null)

    try {
      const response = await processFinancialQuery(query, financeContext, messages)
      const assistantMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: response.category,
        model: response.model,
        isLive: response.isLive,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setBackendStatus((prev) => ({ ...prev, online: true, aiConfigured: true }))
    } catch (err) {
      setLastFailedQuery(query)
      const errorMessage = {
        id: `msg-ai-err-${Date.now()}`,
        sender: 'assistant',
        isError: true,
        text: err.message || 'Unable to generate response from OpenRouter backend.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        failedQuery: query,
      }
      setMessages((prev) => [...prev, errorMessage])
      showToast('AI service response error.', 'danger')
    } finally {
      setIsTyping(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  // Retry sending the failed query
  const handleRetry = (queryToRetry) => {
    if (queryToRetry) {
      handleSendMessage(queryToRetry)
    } else if (lastFailedQuery) {
      handleSendMessage(lastFailedQuery)
    }
  }

  // Handle key press (Enter sends, Shift + Enter creates newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Clear conversation action
  const handleClearConversation = () => {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        id: `msg-welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setLastFailedQuery(null)
    showToast('Conversation cleared.', 'info')
  }

  // Copy assistant response
  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedMessageId(id)
    showToast('Response copied to clipboard!')
    setTimeout(() => {
      setCopiedMessageId(null)
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10 text-left">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-secondary border border-primary/30 uppercase tracking-wider">
              Sample Data
            </span>

            {/* Live Backend Connection Indicator */}
            {backendStatus.online && backendStatus.aiConfigured ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live OpenRouter Connected
              </span>
            ) : backendStatus.online ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-warning/10 text-warning border border-warning/20">
                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                Backend Online (Awaiting Key in .env)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-text-muted border border-border">
                <WifiOff className="w-3 h-3" />
                Backend Port 5000 Offline
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            AI Financial Assistant
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Your intelligent financial companion for smarter everyday money decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearConversation}
            icon={Trash2}
            iconPosition="left"
            className="text-xs text-text-muted hover:text-text-primary border border-border"
          >
            Clear Chat
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearConversation}
            icon={PlusCircle}
            iconPosition="left"
            className="text-xs font-semibold"
          >
            New Session
          </Button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Chat Window + Intelligence Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Conversational AI (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[700px] bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          {/* Header Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-sidebar/80 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-sm ring-2 ring-primary/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary">SpendWise Co-Pilot</h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-primary/20 text-secondary border border-primary/30 flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5" />
                    OpenRouter API
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary">
                  Active Cycle: <span className="text-secondary font-medium">{activePeriod.label}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="hidden sm:inline">Grounds answers strictly in your portfolio</span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant'
              const isCopied = copiedMessageId === msg.id

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 animate-in fade-in duration-200 ${
                    isAssistant ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {/* Assistant Avatar */}
                  {isAssistant && (
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        msg.isError
                          ? 'bg-danger/15 text-danger border-danger/30'
                          : 'bg-primary/15 text-secondary border-primary/30'
                      }`}
                    >
                      {msg.isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm relative group text-xs ${
                      isAssistant
                        ? msg.isError
                          ? 'bg-danger/10 border border-danger/30 text-text-primary rounded-tl-sm'
                          : 'bg-sidebar/90 border border-border text-text-primary rounded-tl-sm'
                        : 'bg-primary text-white rounded-tr-sm shadow-glow-primary'
                    }`}
                  >
                    {/* Assistant Metadata Badge Header */}
                    {isAssistant && (
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-border/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {msg.category && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-secondary border border-primary/30">
                              {msg.category}
                            </span>
                          )}
                          {msg.model && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-text-muted bg-white/5 border border-border">
                              {msg.model}
                            </span>
                          )}
                        </div>

                        {!msg.isError && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            title="Copy response"
                            className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded text-text-muted hover:text-text-primary flex items-center gap-1"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400 font-semibold">Copied</span>
                              </>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Message Body */}
                    {isAssistant ? (
                      <MarkdownRenderer content={msg.text} />
                    ) : (
                      <div className="whitespace-pre-wrap break-words leading-relaxed text-white">
                        {msg.text}
                      </div>
                    )}

                    {/* Retry Button on Error */}
                    {msg.isError && (
                      <div className="mt-3 pt-2 border-t border-danger/20 flex items-center justify-between">
                        <span className="text-[11px] text-danger/80">API Communication Error</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={RotateCcw}
                          iconPosition="left"
                          onClick={() => handleRetry(msg.failedQuery)}
                          className="text-[11px] py-1 px-2.5 bg-danger/20 hover:bg-danger/30 text-danger border-danger/30"
                        >
                          Retry Query
                        </Button>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div
                      className={`text-[10px] mt-2 pt-1 flex items-center justify-end gap-1 ${
                        isAssistant ? 'text-text-muted' : 'text-white/70'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Typing / Model Generation Indicator */}
            {isTyping && (
              <div className="flex gap-3 animate-in fade-in duration-150">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-secondary border border-primary/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-sidebar/90 border border-border rounded-2xl rounded-tl-sm p-3.5 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" />
                  <span className="text-xs text-text-secondary ml-1.5">
                    Consulting OpenRouter model...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3.5 bg-sidebar/90 border-t border-border space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={inputText}
                  disabled={isTyping}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a financial question (e.g., How much did I spend this month?)..."
                  className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-50 resize-none max-h-24"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  aria-label="Send message"
                  className="absolute right-2 top-2 p-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-30 disabled:hover:bg-primary transition-all duration-150 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
              <span>
                Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-border font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-white/5 border border-border font-mono text-[9px]">Shift + Enter</kbd> for newline
              </span>
              <span className="font-mono text-[10px]">
                Backend proxy: <code>/api/ai/chat</code>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Suggested Questions & Context Snapshot (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Suggested Questions */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Sparkles className="w-4 h-4 text-secondary" />
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                Suggested Questions
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Click any prompt to evaluate your live financial metrics with the AI model:
            </p>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {SUGGESTED_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isTyping}
                  onClick={() => handleSendMessage(question)}
                  className="w-full text-left p-2.5 rounded-xl bg-background border border-border hover:border-primary/50 hover:bg-primary/5 text-text-secondary hover:text-text-primary transition-all duration-150 text-xs flex items-center justify-between group cursor-pointer disabled:opacity-50"
                >
                  <span className="line-clamp-2 pr-2">{question}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-secondary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Financial Context Snapshot Card */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-text-primary tracking-tight">
                  Demonstration Portfolio Context
                </h3>
              </div>
              <span className="text-[10px] text-secondary font-mono">Live Sync</span>
            </div>

            <div className="space-y-2 text-text-secondary">
              <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                <span>Period Outflow</span>
                <span className="font-bold text-text-primary">
                  ₹{metrics.periodExpenses?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                <span>Budget Utilization</span>
                <span className="font-bold text-secondary">
                  {metrics.overallUtilization}%
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                <span>Active Loans Balance</span>
                <span className="font-bold text-danger">
                  ₹{metrics.totalLoanOutstanding?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                <span>Accumulated Savings</span>
                <span className="font-bold text-success">
                  ₹{metrics.totalAmountSaved?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-text-muted leading-relaxed">
              * The backend AI assistant explains verified financial results deterministically. It does not perform state modifications or hallucinate authoritative values.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIFinancialAssistant
