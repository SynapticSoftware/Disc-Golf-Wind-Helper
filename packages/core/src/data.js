// ─── Wind Directions ─────────────────────────────────────────────────────────

export const WIND_DIRECTIONS = [
  { id: "headwind",   label: "Headwind",    icon: "↓", desc: "Wind coming straight at you" },
  { id: "tailwind",   label: "Tailwind",    icon: "↑", desc: "Wind pushing from behind" },
  { id: "r2l",        label: "R→L Cross",   icon: "←", desc: "Wind blowing right to left" },
  { id: "l2r",        label: "L→R Cross",   icon: "→", desc: "Wind blowing left to right" },
  { id: "head_r2l",   label: "Head + R→L",  icon: "↙", desc: "Headwind with right-to-left component" },
  { id: "head_l2r",   label: "Head + L→R",  icon: "↘", desc: "Headwind with left-to-right component" },
  { id: "tail_r2l",   label: "Tail + R→L",  icon: "↖", desc: "Tailwind with right-to-left component" },
  { id: "tail_l2r",   label: "Tail + L→R",  icon: "↗", desc: "Tailwind with left-to-right component" },
];

// ─── Terrain Types ───────────────────────────────────────────────────────────

export const TERRAIN_TYPES = [
  { id: "uphill",   label: "Uphill",   icon: "⬆️", desc: "Throwing up a slope" },
  { id: "flat",     label: "Flat",     icon: "➡️", desc: "Level ground, no elevation change" },
  { id: "downhill", label: "Downhill", icon: "⬇️", desc: "Throwing down a slope" },
];

// Terrain adjustment: uphill acts like understable force (shift toward more stable/hyzer),
// downhill acts like overstable/fade force (shift toward less stable/anhyzer).
const _DISC_ORDER  = ['understable', 'stable', 'overstable'];
const _ANGLE_ORDER = ['anhyzer', 'flat', 'hyzer'];

export function terrainAdjust(results, terrain) {
  if (!terrain || terrain === 'flat') return results;
  const shift = terrain === 'uphill' ? 1 : -1;

  const seen = new Set();
  return results.map(r => {
    const di = _DISC_ORDER.indexOf(r.disc);
    const ai = _ANGLE_ORDER.indexOf(r.angle);
    const newDi = Math.min(Math.max(di + shift, 0), 2);
    const newAi = Math.min(Math.max(ai + shift, 0), 2);
    const newDisc  = _DISC_ORDER[newDi];
    const newAngle = _ANGLE_ORDER[newAi];
    const discChanged  = newDisc  !== r.disc;
    const angleChanged = newAngle !== r.angle;

    let summaryPrefix, tipNote;

    if (terrain === 'uphill') {
      if (!discChanged && !angleChanged) {
        summaryPrefix = 'Already at maximum stability — use the most overstable disc available on aggressive hyzer. ';
        tipNote = 'Uphill adds flip/turn force and you are already at the stability ceiling. Use the heaviest, most overstable disc you own, commit to maximum hyzer, and add extra power to fight the slope.';
      } else {
        const what = [discChanged && `${newDisc} disc`, angleChanged && `${newAngle} release`].filter(Boolean).join(' with ');
        summaryPrefix = `Uphill adds turn/flip force — using ${what} to compensate. `;
        const why = [
          discChanged  && `stepped up from ${r.disc} to ${newDisc} because uphill makes discs act more understable`,
          angleChanged && `${newAngle === 'hyzer' ? 'added hyzer angle' : 'released flat'} to counter the uphill flip tendency`,
        ].filter(Boolean).join('; ');
        tipNote = `Uphill adjustment: ${why}. Also add extra power — you are throwing against the slope.`;
      }
    } else {
      if (!discChanged && !angleChanged) {
        summaryPrefix = 'Already at minimum stability — use the flippiest understable disc available on maximum anhyzer. ';
        tipNote = 'Downhill adds overstable/fade force and you are already at the stability floor. Use the most understable disc you own, tilt to maximum anhyzer, and plan for significantly more distance than flat ground.';
      } else {
        const what = [discChanged && `${newDisc} disc`, angleChanged && `${newAngle} release`].filter(Boolean).join(' with ');
        summaryPrefix = `Downhill adds fade — using ${what} to compensate. `;
        const why = [
          discChanged  && `stepped down from ${r.disc} to ${newDisc} because downhill makes discs act more overstable`,
          angleChanged && `${newAngle === 'anhyzer' ? 'opened to anhyzer' : 'released flatter'} to fight the extra fade`,
        ].filter(Boolean).join('; ');
        tipNote = `Downhill adjustment: ${why}. Disc will fly noticeably farther than on flat ground — account for this in your landing zone.`;
      }
    }

    const key = `${newDisc}|${newAngle}`;
    if (seen.has(key)) return null;
    seen.add(key);
    return {
      ...r,
      disc:    newDisc,
      angle:   newAngle,
      summary: summaryPrefix + r.summary,
      tip:     tipNote + ' ' + r.tip,
    };
  }).filter(Boolean);
}

// ─── Shot Shapes ─────────────────────────────────────────────────────────────

export const SHOT_SHAPES = [
  { id: "straight",     label: "Straight",        icon: "➡️",  desc: "Flies as directly at target as possible" },
  { id: "long_left",    label: "Long Left Curve",  icon: "↩️",  desc: "Big sweeping arc finishing left" },
  { id: "short_left",   label: "Short Left Fade",  icon: "↖️",  desc: "Tight left fade at end, not much distance" },
  { id: "long_right",   label: "Long Right Curve", icon: "↪️",  desc: "Big sweeping arc finishing right" },
  { id: "short_right",  label: "Short Right Turn", icon: "↗️",  desc: "Tight right curve, not much distance" },
  { id: "s_curve",      label: "S-Curve",          icon: "〰️",  desc: "Goes one way then curves back the other" },
  { id: "max_distance", label: "Max Distance",     icon: "🚀",  desc: "Get it as far as possible" },
  { id: "putting",      label: "Putting",          icon: "🏹",  desc: "Short controlled throw into the basket" },
];

// ─── Reference Data ───────────────────────────────────────────────────────────
// Keyed by disc stability → throw angle → wind direction

export const refData = {
  understable: {
    hyzer: {
      headwind: { behavior: "Will flip to flat or anhyzer faster than expected. May turn hard right.", tip: "Throw with more hyzer than usual. Headwinds exaggerate turn — compensate by adding extra hyzer angle." },
      tailwind: { behavior: "Already hyzer + understable wants to turn — tailwind reduces lift, disc may stall and fade early.", tip: "Release flatter. Tailwinds reduce disc speed effect, so the flip may not happen as expected." },
      r2l:      { behavior: "Wind pushing disc left; understable wants to go right — these can cancel out or create unpredictable S-curve.", tip: "Aim right of target. Disc will likely still turn right but wind will push it back left — watch for S-curve finish." },
      l2r:      { behavior: "Wind and disc both pushing right — disc goes hard right, may over-turn.", tip: "Aim well left of target. Strong L→R will make understable discs dive right aggressively." },
      head_r2l: { behavior: "Headwind flips disc fast, R→L wind catches the turned disc and pushes left. Chaotic.", tip: "Not ideal. Use a more stable disc. If you must, add significant extra hyzer and aim right." },
      head_l2r: { behavior: "Headwind causes flip, L→R compounds right turn. Disc likely over-turns severely.", tip: "Avoid this combo with understable discs. Go stable or overstable instead." },
      tail_r2l: { behavior: "Disc stalls, turn is suppressed, R→L pushes left. May fade left early.", tip: "Aim right and release with more power than usual to maintain disc speed through the turn." },
      tail_l2r: { behavior: "Turn is suppressed by tailwind, L→R pushes right. Disc may not turn as expected.", tip: "Aim left. The turn will be reduced but L→R will add rightward drift throughout." },
    },
    flat: {
      headwind: { behavior: "Headwind causes understable disc to flip and turn right hard. Classic over-turn.", tip: "Add hyzer to compensate. Understable + headwind = predictable hard right turn. Use this intentionally for right turnover shots." },
      tailwind: { behavior: "Less lift means the disc acts more stable. Turn phase is reduced.", tip: "Can throw a bit harder. Disc will behave closer to stable — good for straighter shots." },
      r2l:      { behavior: "Disc wants to go right (turn), wind pushes left — S-curve likely. Ends close to straight.", tip: "Good combo for a straight finish. Aim slightly right, let the turn and wind offset each other." },
      l2r:      { behavior: "Turn + L→R wind = disc goes right hard. Strong rightward movement.", tip: "Aim far left. This is a big right-curving shot. Useful for right-curving lines around obstacles." },
      head_r2l: { behavior: "Headwind causes flip, R→L softens rightward drift. May fly surprisingly straight.", tip: "Use this to throw a straighter line with an understable disc. Aim slightly right." },
      head_l2r: { behavior: "Headwind flips it, L→R adds to right movement. Very hard right.", tip: "Avoid or use only for intentional hard right turnover lines." },
      tail_r2l: { behavior: "Turn reduced, R→L pushes left. Disc likely finishes left of target.", tip: "Aim right. Power up to maintain turn, or switch to more stable disc." },
      tail_l2r: { behavior: "Turn reduced by tailwind, L→R adds right drift. Relatively predictable rightward line.", tip: "Aim left of target. Good for straight-to-right lines when throwing with the wind." },
    },
    anhyzer: {
      headwind: { behavior: "Very aggressive right turn and potential dive. Disc may ground out.", tip: "High risk. Only use intentionally for max right turnover. Consider more stable disc." },
      tailwind: { behavior: "Anhyzer line holds longer than expected. Slower to fade.", tip: "Good for long sweeping right-curving shots. The tailwind gives it time to glide on the anhyzer angle." },
      r2l:      { behavior: "Disc turning right, wind pushing left — creates a long sweeping S-curve.", tip: "Useful for threading a gap. Aim right, let it sweep left at end." },
      l2r:      { behavior: "Already turning right, L→R compounds it. Disc dives right fast.", tip: "Very risky. Don't use understable anhyzer into L→R wind unless intentionally ground-balling." },
      head_r2l: { behavior: "Flip goes right, wind pushes back — disc may actually fly straight-ish before fading.", tip: "Interesting control shot. Aim right, wind will pull it back. Experiment with release angle." },
      head_l2r: { behavior: "Extreme right turn. Almost guaranteed over-turn and ground.", tip: "Avoid. Use overstable disc in this condition." },
      tail_r2l: { behavior: "Anhyzer line held long, wind slowly corrects leftward. Long sweeping right-then-straight.", tip: "Nice control shot for big right-to-straight lines. Power up slightly." },
      tail_l2r: { behavior: "Right turn amplified by wind. Long right-curving line.", tip: "Useful for big right curves with the wind. Aim well left." },
    },
  },
  stable: {
    hyzer: {
      headwind: { behavior: "Disc holds hyzer longer, fades harder at end. Very reliable left-fading line.", tip: "Aim right of target. Headwind + hyzer = strong reliable fade. Great for precise left-curving approach shots." },
      tailwind: { behavior: "Hyzer releases a bit earlier (disc flips up faster). May finish flatter than expected.", tip: "Add more hyzer angle to maintain intended line. Tailwind acts like making disc slightly understable." },
      r2l:      { behavior: "Hyzer line goes left, wind pushes left too. Strong left drift.", tip: "Aim significantly right. Both the disc flight and wind are pushing left." },
      l2r:      { behavior: "Hyzer wants to go left, wind pushes right — offsets into a straighter-than-normal line.", tip: "Good combo for a straight but left-launched line. Aim just left of target." },
      head_r2l: { behavior: "Headwind holds hyzer, R→L adds left push. Hard predictable left.", tip: "Aim well right. Reliable hard left-fading line. Great for tight left doglegs." },
      head_l2r: { behavior: "Headwind holds hyzer, L→R partially offsets — disc flies straighter than expected.", tip: "Useful for a controlled headwind shot. The L→R counteracts the fade — aim at target." },
      tail_r2l: { behavior: "Hyzer flips up faster, R→L pushes left. May end up near target if you aim slightly right.", tip: "Aim slightly right. Tailwind flips it up, R→L brings it back. Can be a nice straight-ish line." },
      tail_l2r: { behavior: "Hyzer flips early, L→R pushes right. Disc may end up far right.", tip: "Aim left. Or use a more overstable disc to hold the hyzer angle in the tailwind." },
    },
    flat: {
      headwind: { behavior: "Headwind makes disc act overstable. Fades harder and earlier than calm air.", tip: "Aim right of target, release flat or with slight hyzer. This is the most reliable headwind shot." },
      tailwind: { behavior: "Disc acts slightly understable. Longer flight, may not fade as expected.", tip: "Classic tailwind shot — great distance. Disc flies flatter and longer. Good for open fairways." },
      r2l:      { behavior: "Disc fades left at end, wind pushes left. Finishes left of aim point.", tip: "Aim right. A stable disc in R→L wind drifts left throughout. Reliable for left-finishing shots." },
      l2r:      { behavior: "Disc's natural fade fights L→R wind. Flight is straighter than in calm air.", tip: "Great for straight shots. The L→R wind counteracts the natural left fade. Aim at target." },
      head_r2l: { behavior: "Headwind causes early fade, R→L compounds leftward finish.", tip: "Aim well right. Power up to fight both forces. Use for left-curving headwind lines." },
      head_l2r: { behavior: "Headwind causes early overstable behavior, L→R partially counteracts fade. Straighter than expected.", tip: "Good reliable headwind line. Aim slightly right and throw with confidence." },
      tail_r2l: { behavior: "Disc flies longer (tailwind), R→L adds left drift. Finishes left of normal.", tip: "Aim right. Good for long left-finishing shots with the wind. Use for wide left-curving lines." },
      tail_l2r: { behavior: "Long flight, L→R keeps it from fading left. Very straight long shot possible.", tip: "Best distance shot combo. Aim straight at target. This is your big-distance line." },
    },
    anhyzer: {
      headwind: { behavior: "Headwind fights the anhyzer — disc comes back to flat or even fades left. Shorter flight.", tip: "Not ideal. Headwind kills anhyzer lines on stable discs. Use understable disc instead." },
      tailwind: { behavior: "Anhyzer line holds beautifully. Long sweeping right-curving shot.", tip: "Great combo. The tailwind sustains the anhyzer angle. Perfect for long sweeping right-curving lines." },
      r2l:      { behavior: "Disc wants to go right (anhyzer), wind pushes left — creates mild S-curve or near-straight.", tip: "Good for straight shots thrown on anhyzer. Aim right, let wind bring it back." },
      l2r:      { behavior: "Anhyzer + L→R = strong rightward line that holds throughout.", tip: "Aim well left. This will go right decisively. Good for big right-curving lines." },
      head_r2l: { behavior: "Headwind kills anhyzer angle. Disc goes straighter or even fades left.", tip: "Disc won't hold anhyzer in headwind. Switch to understable disc for right-curving headwind shots." },
      head_l2r: { behavior: "Headwind partially kills right curve, L→R maintains some. Moderate right curve.", tip: "Can work. Use understable disc for more reliable right curve into headwind." },
      tail_r2l: { behavior: "Anhyzer line held long by tailwind, R→L brings it back to center. Predictable S-curve.", tip: "Nice controlled shot. Aim right of gap, let the S-curve thread it." },
      tail_l2r: { behavior: "Tailwind holds anhyzer, L→R adds to right movement. Very strong right curve.", tip: "Aim well left. This is a big powerful right-curving line. Great for right doglegs with tailwind." },
    },
  },
  overstable: {
    hyzer: {
      headwind: { behavior: "Disc fades hard and fast. Very short flight, hooks left quickly.", tip: "Use for tight left-curving shots only. Don't expect distance. This is a utility shot." },
      tailwind: { behavior: "Overstable fights tailwind well. Still fades left but flies a bit farther than into headwind.", tip: "Tailwind helps overstable discs go farther. Still reliable left fade. Good control shot." },
      r2l:      { behavior: "Fade goes left, wind pushes left. Hard left — disc finishes well left.", tip: "Aim well right. Reliable but extreme left finish. Good for sharp left doglegs." },
      l2r:      { behavior: "Fade left, wind pushes right — neutralizes some, disc finishes near or slightly left.", tip: "Good control shot. The L→R softens the hard fade. Aim slightly right of target." },
      head_r2l: { behavior: "Headwind + R→L + overstable hyzer = extreme left. Very short very left.", tip: "Only for tight left-curving shots in a tunnel. Expect short distance." },
      head_l2r: { behavior: "Headwind holds hyzer, L→R counteracts some fade. More controllable left curve.", tip: "Solid utility shot. Aim right, disc will curve reliably left without going extreme." },
      tail_r2l: { behavior: "Tailwind helps it fly, R→L + fade = finishes left. Moderate left curve.", tip: "Good controlled left-curving tailwind shot. Aim right and let the disc work." },
      tail_l2r: { behavior: "Tailwind extends flight, L→R softens fade. Disc flies longer and finishes near target.", tip: "Nice distance control shot. Aim slightly right. Good for long left-curving shots." },
    },
    flat: {
      headwind: { behavior: "Overstable disc resists headwind well. Fades predictably left. This is the ideal headwind disc.", tip: "The go-to headwind disc. Throw flat with confidence. Aim right, let it fade back. Very reliable." },
      tailwind: { behavior: "Tailwind makes overstable act more stable. Longer flight before fade.", tip: "Good distance shot. Still fades left at end but gives you more distance than calm air." },
      r2l:      { behavior: "Fade left + wind left = strong left-finishing shot. Predictable.", tip: "Aim right. Very reliable left-finishing shot. Good for consistent left-curving lines." },
      l2r:      { behavior: "Fade wants to go left, L→R pushes right — disc flies surprisingly straight.", tip: "Great straight-line shot in crosswind. The two forces cancel. Aim at target and throw." },
      head_r2l: { behavior: "Wind fights it from both sides — disc still fades left predictably, just shorter flight.", tip: "Reliable but short. Use for accuracy, not distance. Aim right of target." },
      head_l2r: { behavior: "Headwind makes it fade early, L→R slows the drift. Finishes just left of aim.", tip: "Very reliable headwind shot. Aim slightly right of target. This is your money shot in headwinds." },
      tail_r2l: { behavior: "Good distance, disc fades left, R→L adds more leftward push at end.", tip: "Aim right. Nice long left-curving tailwind shot." },
      tail_l2r: { behavior: "Best distance for overstable disc. Fade partly cancelled by L→R. Long and relatively straight.", tip: "Maximum distance shot for overstable. Aim at target or slightly left. This is the big distance line." },
    },
    anhyzer: {
      headwind: { behavior: "Headwind flattens out the anhyzer angle immediately. Disc comes back to flat and fades left.", tip: "Don't bother. Overstable anhyzer into headwind just becomes a flat fade. Use stable or understable disc instead." },
      tailwind: { behavior: "Anhyzer fights the overstable nature — disc may fly relatively straight before mild left fade.", tip: "Usable for near-straight or gentle right-leaning shot. But use stable disc for better results." },
      r2l:      { behavior: "Disc fights to fade left, R→L pushes left — both forces aligned left, but anhyzer angle delays it.", tip: "Will eventually go left. Aim right. Not the best use of overstable anhyzer." },
      l2r:      { behavior: "Anhyzer wants to go right, overstable wants to fade left, L→R pushes right — slight right curve before late left fade.", tip: "Can produce a mild S-curve. Useful for threading specific gaps." },
      head_r2l: { behavior: "Headwind kills anhyzer, R→L pushes left. Disc goes left despite the release angle.", tip: "Don't use. Conditions fight the release angle completely." },
      head_l2r: { behavior: "Headwind and L→R both counteract overstable fade. Disc may actually fly straighter than expected.", tip: "Interesting shot. Can produce a relatively straight flight. Test this in practice before relying on it." },
      tail_r2l: { behavior: "Anhyzer partially maintained by tailwind. R→L pushes back left eventually. Mild S-curve.", tip: "Can work for S-curve lines. Aim right, expect it to swing back left at end." },
      tail_l2r: { behavior: "Tailwind sustains anhyzer, L→R adds right push. Disc holds right curve before late fade.", tip: "Best overstable anhyzer combo. Moderate right-curving line. Aim left, expect gentle right-to-fade finish." },
    },
  },
};

// ─── Disc Suggester Data ──────────────────────────────────────────────────────
// Keyed by shot shape → wind direction → array of recommendations (best first)

export const suggestions = {
  straight: {
    headwind:  [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Overstable discs resist headwind best and still fade predictably.", tip: "Aim right of target — the wind-amplified fade will bring it back.", aimNote: "Aim right" },
      { disc: "stable",     angle: "flat",   confidence: "good", summary: "Stable flat is reliable in a headwind if you don't overthrow it.", tip: "Throw at 70–80% power. Headwind + full power = early fade.", aimNote: "Aim slightly right" },
    ],
    tailwind:  [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Tailwind makes stable discs fly longer and straighter — ideal.", tip: "This is your max-range straight shot. Trust the disc and let it fly.", aimNote: "Aim at target" },
      { disc: "overstable", angle: "flat",   confidence: "good", summary: "Overstable with tailwind acts like a stable disc — straighter than normal.", tip: "Good option if you want a reliable fade at the end of a long straight flight.", aimNote: "Aim slightly left" },
    ],
    r2l:      [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Stable disc fades left, R→L wind pushes left — but a flat release through the middle works if you lead the wind.", tip: "Aim right of target. The drift and fade will combine to bring it back toward center.", aimNote: "Aim right" },
      { disc: "overstable", angle: "flat",   confidence: "good", summary: "Overstable fades left, R→L pushes left — strong left forces, so aim further right.", tip: "Lead the wind significantly. Not as straight as calm air but reliable.", aimNote: "Aim well right" },
      { disc: "understable",angle: "flat",   confidence: "good", summary: "Understable turns right while R→L pushes left — forces cancel for a surprisingly straight flight.", tip: "Aim slightly right. This S-curve trick can produce a very straight result.", aimNote: "Aim slightly right" },
    ],
    l2r:      [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Overstable fade fights the L→R push — two opposing forces = straight line.", tip: "Aim at target. The disc's natural fade and the crosswind cancel each other out perfectly.", aimNote: "Aim at target" },
      { disc: "stable",     angle: "flat",   confidence: "good", summary: "Stable flat also benefits from L→R cancelling the fade.", tip: "Aim slightly left of target. Works best in moderate crosswind.", aimNote: "Aim slightly left" },
    ],
    head_r2l: [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Overstable resists both headwind and R→L drift. Most reliable straight line in tough conditions.", tip: "Aim right. You're fighting headwind fade AND rightward compensation. Power through it.", aimNote: "Aim right" },
      { disc: "stable",     angle: "hyzer",  confidence: "good", summary: "Stable hyzer with headwind — fade and R→L push cancel into something workable.", tip: "Aim well right. This requires precise execution.", aimNote: "Aim well right" },
    ],
    head_l2r: [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Headwind + L→R: the two forces partially cancel — stable flat is surprisingly straight.", tip: "Aim slightly right. Headwind fades it, L→R keeps it from going too far left.", aimNote: "Aim slightly right" },
      { disc: "overstable", angle: "flat",   confidence: "good", summary: "Overstable headwind with L→R softening the fade. Very controllable.", tip: "Reliable money shot in this wind. Aim right of target.", aimNote: "Aim right" },
    ],
    tail_r2l: [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Tailwind helps it fly farther, R→L drift is manageable by aiming right.", tip: "Aim right of target and let the wind do the work. Great distance shot.", aimNote: "Aim right" },
      { disc: "understable",angle: "flat",   confidence: "good", summary: "Understable turn + R→L wind cancel into a straight-ish line.", tip: "Aim slightly right. Power up slightly to ensure the disc gets through its turn phase.", aimNote: "Aim slightly right" },
    ],
    tail_l2r: [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Best straight-line shot in any condition. Tailwind + L→R both reduce fading. Very long and straight.", tip: "This is the ideal setup for a dead-straight distance shot. Aim at target and rip it.", aimNote: "Aim at target" },
      { disc: "overstable", angle: "flat",   confidence: "good", summary: "Overstable fade + L→R push cancel. Long and straighter than calm air.", tip: "Aim at or slightly left of target.", aimNote: "Aim at target" },
    ],
  },
  long_left: {
    headwind:  [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Headwind amplifies overstable fade hard left — ideal for a big left-curving shot.", tip: "Aim right, throw at 80% power. Don't muscle it or it fades too early.", aimNote: "Aim right" },
      { disc: "stable",     angle: "hyzer",  confidence: "good", summary: "Stable hyzer into headwind holds the angle and sweeps left reliably.", tip: "Aim right of target. A confident stroke, not a punch.", aimNote: "Aim right" },
    ],
    tailwind:  [
      { disc: "stable",     angle: "hyzer",  confidence: "best", summary: "Tailwind gives distance, hyzer gives the left-curving shape. Long sweeping left arc.", tip: "Aim right, add extra hyzer to compensate for the tailwind flip.", aimNote: "Aim right" },
      { disc: "overstable", angle: "flat",   confidence: "good", summary: "Overstable with tailwind acts stable — still fades left but gives you more distance.", tip: "Reliable long left fade with the wind behind you.", aimNote: "Aim right" },
    ],
    r2l:      [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Overstable fade + R→L wind = dominant left movement throughout the flight.", tip: "Aim significantly right. This combo curves left hard all the way.", aimNote: "Aim well right" },
      { disc: "stable",     angle: "flat",   confidence: "good", summary: "Stable flat fades left, R→L compounds it. Reliable left-finishing line.", tip: "Aim right of target. Both forces push left.", aimNote: "Aim right" },
    ],
    l2r:      [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "Hyzer holds the angle against the L→R push. Still fades left but you need extra angle.", tip: "Throw with aggressive hyzer. L→R is fighting the fade — you need to commit to the angle.", aimNote: "Aim slightly right" },
      { disc: "stable",     angle: "hyzer",  confidence: "good", summary: "Stable hyzer partially fights the L→R. Will finish slightly left.", tip: "Workable but tricky. Aim right of target.", aimNote: "Aim right" },
    ],
    head_r2l: [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Both headwind and R→L push leftward. Overstable ensures the fade happens. Reliable hard left.", tip: "Power up slightly to fight the headwind. Aim well right.", aimNote: "Aim well right" },
    ],
    head_l2r: [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "Headwind locks in the hyzer, overstable ensures the fade. L→R slightly softens it.", tip: "Aim right. The L→R will temper the left curve slightly but you'll still get a reliable left arc.", aimNote: "Aim right" },
    ],
    tail_r2l: [
      { disc: "stable",     angle: "hyzer",  confidence: "best", summary: "Tailwind adds distance, hyzer + R→L give the left-curving shape.", tip: "Great long left shot. Aim right and let the wind do the work.", aimNote: "Aim right" },
      { disc: "overstable", angle: "flat",   confidence: "good", summary: "Overstable still fades left with tailwind, R→L amplifies the finish left.", tip: "Aim right. Powerful left-curving tailwind shot.", aimNote: "Aim right" },
    ],
    tail_l2r: [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "Overstable hyzer fights the L→R and tailwind flip — holds the left-curving line.", tip: "Use aggressive hyzer. This is a controlled power shot.", aimNote: "Aim right" },
    ],
  },
  short_left: {
    headwind:  [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "Fades hard and fast left. Very short left-finishing shot.", tip: "Throw at 50–60% power. You want it to die left quickly.", aimNote: "Aim right" },
    ],
    tailwind:  [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "Even tailwind can't stop an overstable hyzer from fading left — just slightly farther.", tip: "Throw softly. Tailwind will add distance so release gently to keep it short.", aimNote: "Aim right" },
    ],
    r2l:      [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "Hyzer + R→L wind both pull left. Very tight left-finishing shot.", tip: "Throw softly. Both forces work together — don't overpower it or it drifts too far.", aimNote: "Aim right" },
    ],
    l2r:      [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "L→R fights the fade but overstable hyzer still finishes left.", tip: "Use aggressive hyzer angle to overcome the L→R drift.", aimNote: "Aim right" },
      { disc: "stable",     angle: "hyzer",  confidence: "good", summary: "Stable hyzer in L→R still fades left, just more controlled.", tip: "Aim slightly right of target. L→R softens the fade — a cleaner left curve.", aimNote: "Aim right" },
    ],
    head_r2l: [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "Headwind + R→L + hyzer = maximum left force. Very tight and short left finish.", tip: "Only for a tight left dogleg or tucked basket. Throw at low power.", aimNote: "Aim well right" },
    ],
    head_l2r: [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "Headwind locks in hyzer angle. L→R softens it slightly but still fades left.", tip: "Reliable tight left fade. Aim right of target.", aimNote: "Aim right" },
    ],
    tail_r2l: [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "Throw softly — tailwind will carry it, hyzer + R→L pull it left.", tip: "Throw at low power. The conditions do the work.", aimNote: "Aim right" },
    ],
    tail_l2r: [
      { disc: "overstable", angle: "hyzer",  confidence: "best", summary: "L→R fights the left fade but overstable hyzer still wins with enough angle.", tip: "Use aggressive hyzer. Throw with moderate power.", aimNote: "Aim right" },
    ],
  },
  long_right: {
    headwind:  [
      { disc: "understable",angle: "flat",   confidence: "best", summary: "Headwind flips understable discs right hard — use this intentionally for a long right curve.", tip: "Add slight hyzer so it flips to flat and continues right. Don't throw on anhyzer into headwind.", aimNote: "Aim left" },
      { disc: "stable",     angle: "anhyzer",confidence: "risky", summary: "Headwind kills anhyzer angles on stable discs — it will likely come back left.", tip: "Not reliable. Switch to understable if you need a right curve into headwind.", aimNote: "Aim left" },
    ],
    tailwind:  [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Tailwind sustains the anhyzer angle. Long beautiful right-curving flight.", tip: "Aim left of target and let it sweep right. This is the ideal big right-curve shot.", aimNote: "Aim left" },
      { disc: "stable",     angle: "anhyzer",confidence: "good", summary: "Stable anhyzer holds well in a tailwind. Long sweeping right curve.", tip: "Aim left. Tailwind gives you the distance, anhyzer gives the shape.", aimNote: "Aim left" },
    ],
    r2l:      [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Turn right + R→L eventually corrects = long sweeping S-curve that finishes near center or right.", tip: "Aim right of desired finish. The S-curve lands this closer to straight.", aimNote: "Aim right of finish" },
      { disc: "stable",     angle: "anhyzer",confidence: "good", summary: "Anhyzer goes right, R→L corrects it. A long right arc that comes back.", tip: "Good for threading a right-to-center line.", aimNote: "Aim right" },
    ],
    l2r:      [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Turn right + L→R push right = very dominant right curve. Big right-arcing shot.", tip: "Aim well left. This will go right decisively and stay right.", aimNote: "Aim well left" },
      { disc: "stable",     angle: "anhyzer",confidence: "good", summary: "Anhyzer + L→R wind holds the right curve all the way.", tip: "Aim left. L→R keeps the disc from fading back left.", aimNote: "Aim left" },
    ],
    head_r2l: [
      { disc: "understable",angle: "hyzer",  confidence: "good", summary: "Headwind flips the understable to flat then right. R→L tempers the rightward drift — moderate right curve.", tip: "Add extra hyzer at release. The flip + headwind create the right curve.", aimNote: "Aim left" },
    ],
    head_l2r: [
      { disc: "understable",angle: "flat",   confidence: "best", summary: "Headwind flips it right, L→R pushes right more. Dominant right-curving shot in headwind.", tip: "High risk of over-turn — throw at moderate power only.", aimNote: "Aim well left" },
    ],
    tail_r2l: [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Tailwind holds anhyzer long, R→L corrects back. Long sweeping right-then-center line.", tip: "Aim right of your target. The S-curve finish will land it close to center.", aimNote: "Aim right of finish" },
    ],
    tail_l2r: [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Tailwind holds the turn, L→R adds to it. Very long dominant right curve.", tip: "Aim well left. This is a big powerful right-arc shot. Great for right doglegs with wind.", aimNote: "Aim well left" },
      { disc: "stable",     angle: "anhyzer",confidence: "good", summary: "Tailwind + L→R hold the stable anhyzer angle far. Long sweeping right shot.", tip: "Aim left. Great distance on this line.", aimNote: "Aim left" },
    ],
  },
  short_right: {
    headwind:  [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Headwind + understable + anhyzer = fast aggressive right turn. Disc turns and stops right.", tip: "High risk — disc may over-turn and ground. Throw at low-medium power.", aimNote: "Aim left" },
    ],
    tailwind:  [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Anhyzer holds in tailwind but finishes right. Controlled right-finishing shot.", tip: "Throw at medium power. The tailwind sustains the line.", aimNote: "Aim left" },
    ],
    r2l:      [
      { disc: "understable",angle: "flat",   confidence: "good", summary: "Turn goes right, R→L corrects back. S-curve finishes near center — not great for short right.", tip: "Tricky in R→L. Use anhyzer release for more committed right finish.", aimNote: "Aim left" },
      { disc: "understable",angle: "anhyzer",confidence: "good", summary: "Turn right, R→L pulls back eventually — use for a controlled right then center finish.", tip: "For a short right you may need to throw very softly so it dies right before R→L corrects.", aimNote: "Aim slightly left" },
    ],
    l2r:      [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Turn right + L→R push = aggressive right finish. Very reliable short right.", tip: "Aim left. This will dive right — throw at low-medium power for a controlled short landing.", aimNote: "Aim left" },
    ],
    head_l2r: [
      { disc: "understable",angle: "flat",   confidence: "best", summary: "Headwind flips to right, L→R compounds it. Aggressive short right shot.", tip: "Throw at lower power to prevent over-turning and grounding.", aimNote: "Aim left" },
    ],
    head_r2l: [
      { disc: "understable",angle: "anhyzer",confidence: "risky", summary: "Turn goes right but R→L fights it — may not finish right reliably.", tip: "Risky. Consider a different approach or throw at very low power so it dies right before R→L takes over.", aimNote: "Aim left" },
    ],
    tail_l2r: [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Tailwind + L→R + turn = sustained right curve. Throw softly for short right finish.", tip: "Throw at 50% power. The conditions will carry it right — you just need to start it.", aimNote: "Aim left" },
    ],
    tail_r2l: [
      { disc: "understable",angle: "anhyzer",confidence: "good", summary: "Turn sustained by tailwind. R→L tempers it. Moderate right finish.", tip: "Throw softly and let it S-curve into position. Aim slightly left.", aimNote: "Aim slightly left" },
    ],
  },
  s_curve: {
    headwind:  [
      { disc: "understable",angle: "hyzer",  confidence: "best", summary: "Headwind flips hyzer through flat to right, then R→L (if present) or disc dies left. Natural S-curve in headwind.", tip: "Start with hyzer, let headwind flip it right, then watch it fade back left at end.", aimNote: "Aim slightly right" },
    ],
    tailwind:  [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Tailwind holds anhyzer (right) then as disc slows it fades left. Classic S-curve.", tip: "Aim right of gap, let it sweep right then fade left through the gap.", aimNote: "Aim right of gap" },
    ],
    r2l:      [
      { disc: "understable",angle: "flat",   confidence: "best", summary: "Turn goes right, R→L pushes left. Two opposing forces = natural S-curve.", tip: "Aim slightly right of your target gap. Let the forces work.", aimNote: "Aim right of gap" },
      { disc: "stable",     angle: "anhyzer",confidence: "good", summary: "Anhyzer goes right, disc naturally fades left at end. R→L assists the leftward correction.", tip: "Aim right of where you want to finish.", aimNote: "Aim right" },
    ],
    l2r:      [
      { disc: "overstable", angle: "anhyzer",confidence: "good", summary: "Anhyzer goes right, overstable nature pulls it back left late. Mild S-curve.", tip: "Aim at or slightly left of your target gap.", aimNote: "Aim left of gap" },
    ],
    head_r2l: [
      { disc: "understable",angle: "flat",   confidence: "best", summary: "Headwind flips disc right, R→L corrects leftward at end. Clean S-curve.", tip: "Aim right of the gap. Good for threading a narrow window.", aimNote: "Aim right of gap" },
    ],
    head_l2r: [
      { disc: "understable",angle: "hyzer",  confidence: "good", summary: "Headwind flip goes right, L→R sustains rightward drift. Mild S before going right — less ideal.", tip: "Tricky. Best S-curves come from R→L crosswind conditions.", aimNote: "Aim left" },
    ],
    tail_r2l: [
      { disc: "understable",angle: "anhyzer",confidence: "best", summary: "Tailwind holds anhyzer, R→L corrects back left at end. Long beautiful S-curve.", tip: "Aim right of your target. Great for long threading shots.", aimNote: "Aim right of target" },
    ],
    tail_l2r: [
      { disc: "stable",     angle: "hyzer",  confidence: "good", summary: "Tailwind flips hyzer up (slight right), disc then fades left. L→R adds rightward drift first. Mild S-curve.", tip: "Can thread a gap with this. Aim right of gap, let the flip-then-fade work.", aimNote: "Aim right of gap" },
    ],
  },
  max_distance: {
    headwind:  [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "In headwind, overstable is the longest disc. It resists the wind and still flies far.", tip: "Throw at 80–90% power into a headwind. Don't max out — clean release beats raw power.", aimNote: "Aim right" },
      { disc: "stable",     angle: "flat",   confidence: "good", summary: "Stable flat is a reliable second option into headwind.", tip: "Throw slightly softer than normal. Headwind + overpowering = early fade and lost distance.", aimNote: "Aim right" },
    ],
    tailwind:  [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Tailwind + stable flat = maximum possible distance. The wind adds carry and the disc flies flat.", tip: "This is the big one. Full power, clean release, aim at target. Trust it.", aimNote: "Aim at target" },
      { disc: "understable",angle: "flat",   confidence: "good", summary: "Understable in tailwind acts like a stable disc — extra distance potential.", tip: "Don't overthrow it — tailwind makes understable disc less turny. Clean form beats power.", aimNote: "Aim at target" },
    ],
    r2l:      [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Stable flat in R→L — aim right and let the wind carry it. Good distance with natural correction.", tip: "Aim well right. The wind will carry it back toward center after the fade.", aimNote: "Aim right" },
    ],
    l2r:      [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "L→R kills the natural fade = longer, flatter flight. Best crosswind distance shot.", tip: "Aim at target or slightly left. The wind keeps it from fading and gives extra carry.", aimNote: "Aim at target" },
      { disc: "overstable", angle: "flat",   confidence: "good", summary: "Overstable + L→R = surprising distance as fade is cancelled.", tip: "Aim at or slightly left of target.", aimNote: "Aim at target" },
    ],
    head_r2l: [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Tough conditions. Overstable is the best tool. Aim right and power through it.", tip: "Don't expect distance records here. Prioritize control over power.", aimNote: "Aim right" },
    ],
    head_l2r: [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Headwind + L→R = overstable flies straight and far. Best headwind distance option.", tip: "This is your go-to in this wind. Aim right, trust the disc.", aimNote: "Aim right" },
    ],
    tail_r2l: [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Tailwind distance with R→L drift — aim right and let the wind carry it far.", tip: "Big distance shot. Aim right, throw full power, let the wind work.", aimNote: "Aim right" },
    ],
    tail_l2r: [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Best possible distance condition. Tailwind + L→R = long straight flight with extra carry.", tip: "Maximum distance throw. Full power, aim at target. This is your record-distance setup.", aimNote: "Aim at target" },
      { disc: "understable",angle: "flat",   confidence: "good", summary: "Understable in this wind acts very stable. Extra distance potential.", tip: "Clean form, full power. The two forces keep it flying straight and far.", aimNote: "Aim at target" },
    ],
  },
  putting: {
    headwind:  [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Headwind pushes the disc down and left — overstable resists and tracks straight to the basket.", tip: "Aim slightly right of the basket. Throw with a firm flat release. Don't finesse it — commit.", aimNote: "Aim slightly right" },
      { disc: "stable",     angle: "flat",   confidence: "good", summary: "Stable flat putt holds a reliable line into headwind if you don't under-throw.", tip: "Power up slightly vs. calm air. Headwind will slow the disc — it needs more juice to reach.", aimNote: "Aim at basket" },
    ],
    tailwind:  [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Tailwind carries the putt nicely but can push it past the basket if you don't account for the extra carry.", tip: "Throw softer than usual. Tailwind adds carry — dial back power to avoid sailing high.", aimNote: "Aim at basket" },
      { disc: "understable",angle: "flat",   confidence: "good", summary: "Understable in tailwind acts more stable. Light easy release works well for a soft putt.", tip: "Soft and smooth. Let the tailwind do the work.", aimNote: "Aim at basket" },
    ],
    r2l:      [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "R→L drift pushes the disc left — overstable's rightward stability counteracts it for a truer line.", tip: "Aim right of the basket. Overstable fade and R→L push cancel toward center.", aimNote: "Aim right of basket" },
      { disc: "stable",     angle: "flat",   confidence: "good", summary: "Stable flat putt drifts left in R→L wind — manageable with proper aim compensation.", tip: "Aim right of basket. More compensation needed in stronger wind.", aimNote: "Aim right of basket" },
    ],
    l2r:      [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "L→R wind pushes right, overstable's natural fade pushes left — they cancel for a straight putt.", tip: "Aim at the basket. These forces offset each other. Very reliable in moderate L→R wind.", aimNote: "Aim at basket" },
      { disc: "stable",     angle: "flat",   confidence: "good", summary: "Stable flat putt drifts right in L→R — aim left to compensate.", tip: "Aim left of basket. The L→R will drift it back right.", aimNote: "Aim left of basket" },
    ],
    head_r2l: [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Headwind slows it, R→L pushes left — overstable fights both. Best putt choice in these conditions.", tip: "Aim right of basket and power up. This wind combo is tough — commit to the putt.", aimNote: "Aim right of basket" },
    ],
    head_l2r: [
      { disc: "overstable", angle: "flat",   confidence: "best", summary: "Headwind + L→R: headwind slows the disc, L→R partially cancels fade. Overstable tracks reliably.", tip: "Aim slightly right of basket. Throw with authority — headwind demands more power.", aimNote: "Aim slightly right" },
    ],
    tail_r2l: [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Tailwind adds carry, R→L pushes left. Aim right and throw softer than normal.", tip: "Aim right and back off your power. Let the wind carry it to the basket.", aimNote: "Aim right of basket" },
    ],
    tail_l2r: [
      { disc: "stable",     angle: "flat",   confidence: "best", summary: "Tailwind + L→R: wind carries the disc forward and rightward. Soft putt, aim left.", tip: "Throw very softly. The conditions will carry it. Aim left of basket to account for drift.", aimNote: "Aim left of basket" },
    ],
  },
};
