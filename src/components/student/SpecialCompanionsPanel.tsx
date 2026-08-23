import { SPECIAL_PETS } from '../../data/specialRewards';
import type { StudentState } from '../../store/useGameStore';

type Props = {
  student: StudentState;
};

export default function SpecialCompanionsPanel({ student }: Props) {
  const ownedPets = (student.specialUnlocks ?? [])
    .filter(unlock => unlock.kind === 'pet')
    .map(unlock => ({ unlock, pet: SPECIAL_PETS[unlock.unlockId] }))
    .filter(entry => Boolean(entry.pet));

  if (ownedPets.length === 0) return null;

  return (
    <section className="mt-4 rounded-3xl border border-cyan-300/25 bg-gradient-to-l from-cyan-500/10 via-fuchsia-500/10 to-purple-500/10 p-5 text-right">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-black text-white">✨ חיות מסע מיוחדות</h3>
          <p className="mt-1 text-xs leading-5 text-magic-soft/60">
            היצורים האלה לא מחליפים את חיית המחמד הרגילה. הם מזכרת חיה ממסעות
            מיוחדים שהשלמת בממלכה.
          </p>
        </div>
        <div className="rounded-xl border border-cyan-200/15 bg-black/20 px-3 py-2 text-center text-xs font-black text-cyan-100">
          {ownedPets.length} יצורים נדירים
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ownedPets.map(({ unlock, pet }) => (
          <div
            key={unlock.unlockId}
            className="relative overflow-hidden rounded-2xl border border-fuchsia-200/25 bg-black/20 p-4"
          >
            <div className="absolute -left-4 -top-5 text-7xl opacity-10">
              {pet.emoji}
            </div>
            <div className="relative flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-fuchsia-300/20 to-cyan-300/15 text-5xl shadow-[0_0_30px_rgba(232,121,249,0.12)]">
                {pet.emoji}
              </div>
              <div>
                <div className="text-lg font-black text-white">{pet.nameHe}</div>
                <div className="mt-1 text-[10px] font-black text-fuchsia-200/70">
                  התקבל דרך {pet.originHe}
                </div>
                <div className="mt-2 text-xs leading-5 text-magic-soft/65">
                  {pet.descriptionHe}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
