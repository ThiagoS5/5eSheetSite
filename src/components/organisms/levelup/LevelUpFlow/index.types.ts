export interface LevelUpFlowProps {
  open: boolean;
  /**
   * Called when the flow closes. `committed` is true when the level-up was
   * accepted (Finish, or leaving to the subclass screen to continue it) and
   * false when it was cancelled (Escape, backdrop, X) — the caller reverts the
   * level increment in the latter case so cancelling never leaves the character
   * a level higher.
   */
  onClose: (committed: boolean) => void;
}
