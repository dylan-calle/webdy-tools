"use client";

import { useState } from "react";
import {
  PasswordIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  SparkleIcon,
  ArrowsClockwiseIcon,
  ArrowDownIcon,
  TrashIcon,
  KeyIcon,
  TimerIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import {
  hashPassword,
  verifyPassword,
  parseBcryptHash,
  generateRandomPassword,
  isValidBcryptHash,
  BCRYPT_SAMPLES,
  type BcryptHashInfo,
} from "@/lib/bcrypt-utils";

export default function BcryptPage() {
  // Generator State
  const [genPassword, setGenPassword] = useState("mySecurePassword123!");
  const [showGenPassword, setShowGenPassword] = useState(true);
  const [rounds, setRounds] = useState<number>(10);
  const [genHash, setGenHash] = useState<string>("");
  const [genHashInfo, setGenHashInfo] = useState<BcryptHashInfo | null>(null);
  const [genElapsedMs, setGenElapsedMs] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Verifier State
  const [verifyPasswordInput, setVerifyPasswordInput] = useState("");
  const [showVerifyPassword, setShowVerifyPassword] = useState(true);
  const [verifyHashInput, setVerifyHashInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    match: boolean | null;
    elapsedMs: number | null;
    error?: string;
  } | null>(null);

  // Live inspection of the verify hash input
  const liveVerifyHashInfo = parseBcryptHash(verifyHashInput);

  // Handle Hash Generation
  const handleGenerate = async () => {
    if (!genPassword) return;
    setIsGenerating(true);
    setGenElapsedMs(null);

    setTimeout(async () => {
      try {
        const { hash, elapsedMs, info } = await hashPassword(genPassword, rounds);
        setGenHash(hash);
        setGenHashInfo(info);
        setGenElapsedMs(elapsedMs);
      } catch (err) {
        console.error("Hashing failed", err);
      } finally {
        setIsGenerating(false);
      }
    }, 20);
  };

  // Handle Verification
  const handleVerify = async () => {
    if (!verifyHashInput.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);

    setTimeout(async () => {
      try {
        const res = await verifyPassword(verifyPasswordInput, verifyHashInput);
        setVerifyResult({
          match: res.match,
          elapsedMs: res.elapsedMs,
          error: res.error,
        });
      } catch (err) {
        setVerifyResult({
          match: false,
          elapsedMs: null,
          error: err instanceof Error ? err.message : "Verification error",
        });
      } finally {
        setIsVerifying(false);
      }
    }, 20);
  };

  // Quick Action: Send generated credentials down to the Verifier section
  const handleSendToVerifier = () => {
    if (!genHash) return;
    setVerifyPasswordInput(genPassword);
    setVerifyHashInput(genHash);
    setVerifyResult(null);
    document.getElementById("bcrypt-verifier-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // Quick Action: Load Sample into Verifier
  const handleLoadSampleToVerifier = () => {
    setVerifyPasswordInput(BCRYPT_SAMPLES.plaintext);
    setVerifyHashInput(BCRYPT_SAMPLES.hash);
    setVerifyResult(null);
  };

  return (
    <ToolLayout
      title="BCrypt Generator & Checker"
      description="Client-side BCrypt hash generator and verifier. Hash plaintext passwords with customizable salt rounds or verify existing hashes."
    >
      <div className="space-y-10">
        {/* ======================================================== */}
        {/* SECTION 1: HASH GENERATOR (ENCRYPT)                      */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <PasswordIcon size={20} className="text-primary" />
            <h2 className="text-base font-semibold tracking-tight">1. BCrypt Hash Generator (Encrypt)</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Password & Rounds Configuration */}
            <div className="bg-card text-card-foreground border border-border rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <KeyIcon size={16} /> Plaintext Password
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setGenPassword(generateRandomPassword(16))}
                    title="Generate Random Password"
                  >
                    <SparkleIcon size={12} className="mr-1" />
                    Random
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setGenPassword("")}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <TrashIcon size={12} />
                  </Button>
                </div>
              </div>

              {/* Password Input Box */}
              <div className="relative">
                <input
                  type={showGenPassword ? "text" : "password"}
                  value={genPassword}
                  onChange={(e) => setGenPassword(e.target.value)}
                  placeholder="Enter plaintext to hash..."
                  className="w-full bg-muted/40 border border-border rounded-lg px-3.5 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:border-primary/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowGenPassword(!showGenPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title={showGenPassword ? "Hide password" : "Show password"}
                >
                  {showGenPassword ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>

              {/* Rounds / Cost Factor Controls */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontalIcon size={15} className="text-muted-foreground" />
                    <span className="text-xs font-medium">Cost Factor (Salt Rounds):</span>
                  </div>
                  <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded border border-border">
                    {rounds} rounds ({Math.pow(2, rounds).toLocaleString()} iterations)
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min={4}
                  max={16}
                  value={rounds}
                  onChange={(e) => setRounds(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />

                {/* Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
                  <Button
                    variant={rounds === 10 ? "default" : "outline"}
                    size="xs"
                    onClick={() => setRounds(10)}
                  >
                    10 (Fast Dev)
                  </Button>
                  <Button
                    variant={rounds === 12 ? "default" : "outline"}
                    size="xs"
                    onClick={() => setRounds(12)}
                  >
                    12 (Recommended)
                  </Button>
                  <Button
                    variant={rounds === 14 ? "default" : "outline"}
                    size="xs"
                    onClick={() => setRounds(14)}
                  >
                    14 (High Security)
                  </Button>
                </div>

                {/* High Rounds Warning */}
                {rounds >= 13 && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                    <WarningCircleIcon size={16} className="shrink-0" />
                    <span>
                      Rounds {rounds} requires {Math.pow(2, rounds).toLocaleString()} iterations.
                      Computation may take several seconds in the browser.
                    </span>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                variant="default"
                onClick={handleGenerate}
                disabled={!genPassword || isGenerating}
                className="w-full gap-2 mt-2 shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <ArrowsClockwiseIcon size={15} className="animate-spin" />
                    Computing BCrypt Hash...
                  </>
                ) : (
                  <>
                    <PasswordIcon size={15} />
                    Generate BCrypt Hash
                  </>
                )}
              </Button>
            </div>

            {/* Right Column: Generated Output & Breakdown */}
            <div className="bg-card text-card-foreground border border-border rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheckIcon size={16} /> Generated BCrypt Hash
                  </span>
                  {genElapsedMs !== null && (
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <TimerIcon size={13} /> {genElapsedMs} ms
                    </span>
                  )}
                </div>

                {genHash ? (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-muted/40 border border-border rounded-lg relative group">
                      <p className="font-mono text-xs break-all leading-relaxed select-all text-primary font-medium">
                        {genHash}
                      </p>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
                        <span>60 characters · {rounds} rounds</span>
                        <CopyButton text={genHash} label="Copy Hash" className="h-6 text-xs px-2" />
                      </div>
                    </div>

                    {/* Hash Anatomy Breakdown */}
                    {genHashInfo && genHashInfo.isValid && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-semibold text-foreground">
                          Hash Anatomy Breakdown:
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                            <span className="text-muted-foreground block text-[10px]">Algorithm</span>
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                              ${genHashInfo.version}$ (BCrypt)
                            </span>
                          </div>
                          <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                            <span className="text-muted-foreground block text-[10px]">Work Factor</span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              ${genHashInfo.rounds}$ ({genHashInfo.iterations.toLocaleString()} iter)
                            </span>
                          </div>
                          <div className="p-2.5 bg-muted/30 border border-border rounded-lg col-span-2">
                            <span className="text-muted-foreground block text-[10px]">Salt (22 chars)</span>
                            <span className="text-sky-600 dark:text-sky-400 break-all text-[11px]">
                              {genHashInfo.salt}
                            </span>
                          </div>
                          <div className="p-2.5 bg-muted/30 border border-border rounded-lg col-span-2">
                            <span className="text-muted-foreground block text-[10px]">Checksum (31 chars)</span>
                            <span className="text-emerald-600 dark:text-emerald-400 break-all text-[11px]">
                              {genHashInfo.checksum}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground space-y-2">
                    <PasswordIcon size={32} className="mx-auto opacity-30" />
                    <p className="text-xs">
                      Enter a password and click &quot;Generate BCrypt Hash&quot; to compute the hash.
                    </p>
                  </div>
                )}
              </div>

              {genHash && (
                <div className="pt-4 border-t border-border mt-4">
                  <Button
                    variant="outline"
                    onClick={handleSendToVerifier}
                    className="w-full gap-2 text-xs cursor-pointer"
                  >
                    <ArrowDownIcon size={14} /> Send to Verifier Below
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: HASH VERIFIER (CHECK)                         */}
        {/* ======================================================== */}
        <section id="bcrypt-verifier-section" className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <ShieldCheckIcon size={20} className="text-primary" />
            <h2 className="text-base font-semibold tracking-tight">2. BCrypt Hash Verifier (Check)</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Verification Inputs */}
            <div className="bg-card text-card-foreground border border-border rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheckIcon size={16} /> Test Password & Hash
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleLoadSampleToVerifier}
                    title="Load sample pair"
                  >
                    <SparkleIcon size={12} className="mr-1" />
                    Load Sample
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setVerifyPasswordInput("");
                      setVerifyHashInput("");
                      setVerifyResult(null);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <TrashIcon size={12} />
                  </Button>
                </div>
              </div>

              {/* Plaintext Password to Verify */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Plaintext Password:
                </label>
                <div className="relative">
                  <input
                    type={showVerifyPassword ? "text" : "password"}
                    value={verifyPasswordInput}
                    onChange={(e) => setVerifyPasswordInput(e.target.value)}
                    placeholder="Enter plaintext password to check..."
                    className="w-full bg-muted/40 border border-border rounded-lg px-3.5 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:border-primary/60 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showVerifyPassword ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>

              {/* BCrypt Hash to Verify */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    BCrypt Hash (60 chars):
                  </label>
                  {verifyHashInput.trim() && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isValidBcryptHash(verifyHashInput)
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isValidBcryptHash(verifyHashInput)
                        ? `Valid format (${liveVerifyHashInfo.rounds} rounds)`
                        : `${verifyHashInput.trim().length}/60 chars (invalid format)`}
                    </span>
                  )}
                </div>
                <textarea
                  value={verifyHashInput}
                  onChange={(e) => setVerifyHashInput(e.target.value)}
                  placeholder="Paste 60-character BCrypt hash ($2a$, $2b$, or $2y$)..."
                  className="w-full bg-muted/40 border border-border rounded-lg p-3 text-xs font-mono resize-none h-24 focus:outline-none focus:border-primary/60 transition-colors"
                  spellCheck={false}
                />
              </div>

              {/* Verify Action Button */}
              <Button
                variant="default"
                onClick={handleVerify}
                disabled={!verifyHashInput.trim() || isVerifying}
                className="w-full gap-2 shadow-xs cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <ArrowsClockwiseIcon size={15} className="animate-spin" />
                    Verifying Hash...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon size={15} />
                    Verify / Compare Password
                  </>
                )}
              </Button>
            </div>

            {/* Right Column: Verification Results */}
            <div className="bg-card text-card-foreground border border-border rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircleIcon size={16} /> Verification Result
                  </span>
                </div>

                {verifyResult ? (
                  <div className="space-y-4">
                    {/* MATCH STATE */}
                    {verifyResult.match === true && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <CheckCircleIcon size={20} />
                          Match! The password matches the hash.
                        </div>
                        <p className="text-xs opacity-90 font-sans">
                          The cryptographic key expansion and salt successfully authenticated this
                          password.
                        </p>
                        {verifyResult.elapsedMs !== null && (
                          <div className="text-[11px] font-mono text-muted-foreground pt-1 flex items-center gap-1">
                            <TimerIcon size={12} /> Verified in {verifyResult.elapsedMs} ms
                          </div>
                        )}
                      </div>
                    )}

                    {/* MISMATCH STATE */}
                    {verifyResult.match === false && !verifyResult.error && (
                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <XCircleIcon size={20} />
                          No Match! The password does NOT match the hash.
                        </div>
                        <p className="text-xs opacity-90 font-sans">
                          The provided plaintext password produces a different checksum with the
                          hash&apos;s salt.
                        </p>
                        {verifyResult.elapsedMs !== null && (
                          <div className="text-[11px] font-mono text-muted-foreground pt-1 flex items-center gap-1">
                            <TimerIcon size={12} /> Checked in {verifyResult.elapsedMs} ms
                          </div>
                        )}
                      </div>
                    )}

                    {/* ERROR / INVALID FORMAT */}
                    {verifyResult.error && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <WarningCircleIcon size={20} />
                          Invalid Hash Format
                        </div>
                        <p className="text-xs opacity-90 font-sans">{verifyResult.error}</p>
                      </div>
                    )}

                    {/* Verified Hash Metadata */}
                    {liveVerifyHashInfo.isValid && (
                      <div className="p-3 bg-muted/30 border border-border rounded-lg text-xs font-mono space-y-1">
                        <div className="text-muted-foreground text-[10px] uppercase font-sans font-semibold">
                          Detected Hash Properties
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Algorithm:</span>
                          <span>${liveVerifyHashInfo.version}$</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rounds:</span>
                          <span>
                            {liveVerifyHashInfo.rounds} ({liveVerifyHashInfo.iterations.toLocaleString()} iter)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground space-y-2">
                    <ShieldCheckIcon size={32} className="mx-auto opacity-30" />
                    <p className="text-xs">
                      Enter a password and a BCrypt hash, then click &quot;Verify / Compare Password&quot;.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Security & Client-Side Privacy Note */}
        <div className="p-4 bg-muted/30 border border-border rounded-xl text-xs text-muted-foreground space-y-1">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheckIcon size={14} className="text-primary" /> 100% Client-Side Computation
          </div>
          <p>
            All hashing and verification computations run directly inside your browser using pure
            JavaScript. Passwords and hashes are never transmitted over any network or stored on a server.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
