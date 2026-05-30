import { useMemo, useState } from 'react';
import { shopItems, getItemById } from '../../data/items';
import { THEMES } from '../../data/themes';
import type { ThemeId } from '../../data/themes';
import { useGameStore } from '../../store/useGameStore';
import type { StudentState } from '../../store/useGameStore';
import { applyPurchase, xpForSpend } from '../../logic/purchase';
import { levelFromXp } from '../../logic/leveling';
import RarityBadge from '../shared/RarityBadge';
import { BOX_TIERS } from '../../data/boxes';
import type { BoxTier } from '../../data/boxes';

type Props = {
  student: StudentState;
};

export default function Shop({ student }: Props) {
  const updateStudent = useGameStore(s => s.updateStudent);
  const [message, setMessage] = useState<string | null>(null);

  const items = useMemo(() => {
    return shopItems().filter(
      item =>
        item.theme === 'generic' || student.unlockedThemes.includes(item.theme)
    );
  }, [student.unlockedThemes]);

  const pastRewardItems = useMemo(
    () => student.pastRewards.map(id => getItemById(id)).filter(Boolean),
    [student.pastRewards]
  );

  function showMessage(text: string, duration = 2500) {
    setMessage(text);
    setTimeout(() => setMessage(null), duration);
  }

  function buy(itemId: string) {
    const item = getItemById(itemId);
    if (!item) return;

    const out = applyPurchase(student, item, 'shop');
    if (!out) return;

    if (!out.result.ok) {
      showMessage(out.result.reason || 'לא ניתן לקנות', 2000);
      return;
    }

    updateStudent(student.id, out.next);

    showMessage(
      out.result.leveledUp
        ? `🎉 קנית את ${item.nameHe} ועלית לרמה ${out.result.levelAfter}!`
        : `קנית את ${item.nameHe} (+${
            item.price <= 0 ? 0 : Math.floor(item.price / 2)
          } XP)`
    );
  }

  function buyBox(tier: BoxTier, themeId: ThemeId) {
    const box = BOX_TIERS[tier];

    if (student.points < box.price) {
      showMessage('אין מספיק נקודות לקופסה הזאת', 2000);
      return;
    }

    if (student.inventory.length >= student.capacities.inventory) {
      showMessage('המלאי מלא', 2000);
      return;
    }

    const xpGain = xpForSpend(box.price, 'box');
    const newXp = student.xp + xpGain;

    const levelBefore = student.level;
    const levelAfter = levelFromXp(newXp);
    const leveledUp = levelAfter > levelBefore;

    updateStudent(student.id, {
      points: student.points - box.price,
      xp: newXp,
      level: levelAfter,
      pendingLevelUps:
        student.pendingLevelUps + (leveledUp ? levelAfter - levelBefore : 0),
      inventory: [
        ...student.inventory,
        {
          id: `box_${tier}_${themeId}_${Date.now()}`,
          itemId: `box_${tier}_${themeId}`,
          kind: 'box',
          boxTier: tier,
          boxTheme: themeId,
          acquiredAt: Date.now(),
          placedZone: null,
          placedSlot: null,
        },
      ],
    });

    showMessage(
      leveledUp
        ? `🎁 קנית ${box.nameHe}, קיבלת XP ועלית לרמה ${levelAfter}!`
        : `🎁 קנית ${box.nameHe} (+${xpGain} XP)`
    );
  }

  return (
    <div>
      {message && (
        <div className="bg-magic-accent/20 border border-magic-accent text-magic-accent rounded-xl p-3 mb-4 text-sm text-center">
          {message}
        </div>
      )}

      <h3 className="text-magic-accent font-bold mb-3">חנות</h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {items.map(item => {
          const theme = THEMES.find(t => t.id === item.theme);
          const affordable = student.points >= item.price;

          return (
            <div
              key={item.id}
              className="bg-magic-bg/40 rounded-2xl p-3 flex flex-col"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-2xl">{theme?.emoji}</span>
                <RarityBadge rarity={item.rarity} />
              </div>

              <div className="text-white font-bold text-sm">{item.nameHe}</div>

              <div className="text-magic-soft/70 text-xs mb-2 flex-1">
                {item.descriptionHe}
              </div>

              <button
                onClick={() => buy(item.id)}
                disabled={!affordable}
                className="bg-magic-accent text-magic-bg font-bold py-2 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {item.price} נק׳
              </button>
            </div>
          );
        })}
      </div>

      <h3 className="text-magic-accent font-bold mb-3">קופסאות</h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {student.unlockedThemes.flatMap(themeId =>
          (Object.keys(BOX_TIERS) as BoxTier[])
            .filter(tier => student.level >= BOX_TIERS[tier].minLevel)
            .map(tier => {
              const box = BOX_TIERS[tier];
              const theme = THEMES.find(t => t.id === themeId);
              const affordable = student.points >= box.price;

              return (
                <div
                  key={`${themeId}_${tier}`}
                  className="bg-magic-bg/40 rounded-2xl p-3 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-3xl">{box.emoji}</span>
                    <span className="text-2xl">{theme?.emoji}</span>
                  </div>

                  <div className="text-white font-bold text-sm">
                    {box.nameHe} — {theme?.nameHe ?? themeId}
                  </div>

                  <div className="text-magic-soft/70 text-xs mb-2 flex-1">
                    קופסה נושאית. אפשר לפתוח אותה מהמלאי ולקבל פרס מהנושא הזה.
                  </div>

                  <button
                    onClick={() => buyBox(tier, themeId)}
                    disabled={!affordable}
                    className="bg-magic-accent text-magic-bg font-bold py-2 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {box.price} נק׳
                  </button>
                </div>
              );
            })
        )}
      </div>

      {pastRewardItems.length > 0 && (
        <>
          <h3 className="text-magic-soft font-bold mb-3">
            פרסים מהעבר ({pastRewardItems.length})
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {pastRewardItems.map(item => {
              if (!item) return null;

              return (
                <div key={item.id} className="bg-magic-bg/40 rounded-2xl p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xl">✨</span>
                    <RarityBadge rarity={item.rarity} />
                  </div>

                  <div className="text-white font-bold text-sm">
                    {item.nameHe}
                  </div>

                  <button
                    onClick={() => buy(item.id)}
                    disabled={student.points < item.price}
                    className="bg-magic-soft text-magic-bg font-bold py-2 rounded-xl text-sm mt-2 w-full disabled:opacity-40"
                  >
                    {item.price} נק׳
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}