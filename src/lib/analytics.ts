export const GA_MEASUREMENT_ID = 'G-KV2KS6RJY0'

type GtagFn = (command: string, ...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

function gtagEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return
  }
  window.gtag('event', name, params ?? {})
}

export function trackGameStart(params: {
  playerCount: number
  startingScore: number
  hasWinningScore: boolean
  winningScore?: number
}) {
  gtagEvent('game_start', {
    player_count: params.playerCount,
    starting_score: params.startingScore,
    has_winning_score: params.hasWinningScore,
    ...(params.winningScore !== undefined ? { winning_score: params.winningScore } : {}),
  })
}

export function trackRoundAdd(roundNumber: number, playerCount: number) {
  gtagEvent('round_add', {
    round_number: roundNumber,
    player_count: playerCount,
  })
}

export function trackRoundEditLast(roundNumber: number, playerCount: number) {
  gtagEvent('round_edit_last', {
    round_number: roundNumber,
    player_count: playerCount,
  })
}

export function trackRoundDeleteLast(roundNumberAfter: number, playerCount: number) {
  gtagEvent('round_delete_last', {
    round_number: roundNumberAfter,
    player_count: playerCount,
  })
}

export function trackGameEnd(params: {
  endType: 'manual' | 'winning_score'
  roundCount: number
  playerCount: number
  winnerCount?: number
  winningScore?: number
}) {
  gtagEvent('game_end', {
    end_type: params.endType,
    round_count: params.roundCount,
    player_count: params.playerCount,
    ...(params.winnerCount !== undefined ? { winner_count: params.winnerCount } : {}),
    ...(params.winningScore !== undefined ? { winning_score: params.winningScore } : {}),
  })
}

export function trackVictoryPopupView(winnerCount: number, winningScore: number) {
  gtagEvent('victory_popup_view', {
    winner_count: winnerCount,
    winning_score: winningScore,
  })
}

export function trackVictoryContinue(roundCount: number, playerCount: number) {
  gtagEvent('victory_continue', {
    round_count: roundCount,
    player_count: playerCount,
  })
}

export function trackShareResult(success: boolean) {
  gtagEvent('share_result', {
    method: 'clipboard',
    success,
  })
}

export function trackGameReset(screen: 'match' | 'summary') {
  gtagEvent('game_reset', { screen })
}

export function trackSummaryBackToMatch(roundCount: number) {
  gtagEvent('summary_back_to_match', { round_count: roundCount })
}

export function trackLanguageChange(language: 'vi' | 'en') {
  gtagEvent('language_change', { language })
}

export function trackSetupPlayerChange(action: 'add' | 'remove', playerCount: number) {
  gtagEvent('setup_player_change', {
    action,
    player_count: playerCount,
  })
}
