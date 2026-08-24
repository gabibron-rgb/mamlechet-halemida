import { useEffect, useState } from 'react';

import {
  personalGuestConfigFromFeature,
  type PersonalFeature,
  type PersonalGuestRoomId,
} from '../../data/personalFeatures';
import { getStudentPersonalFeatures } from '../../lib/supabasePersonalFeatures';
import PersonalRoomGuest from './PersonalRoomGuest';

type Props = {
  studentId: string;
  roomId: PersonalGuestRoomId;
  isEditing: boolean;
};

export function PersonalRoomGuestStyles() {
  return (
    <style>{`
      @keyframes personalGuestIdle {
        0%, 100% { transform: translateY(0) scaleY(1); }
        50% { transform: translateY(0) scaleY(1.012); }
      }
      @keyframes personalGuestWalk {
        0%, 100% { transform: translateY(0) rotate(-0.6deg); }
        50% { transform: translateY(-1.5px) rotate(0.6deg); }
      }
      .personal-guest-idle > img {
        animation: personalGuestIdle 2.8s ease-in-out infinite;
        transform-origin: bottom center;
      }
      .personal-guest-walking > img {
        animation: personalGuestWalk 0.42s ease-in-out infinite;
        transform-origin: bottom center;
      }
      @media (prefers-reduced-motion: reduce) {
        .personal-guest-idle > img,
        .personal-guest-walking > img {
          animation: none !important;
        }
      }
    `}</style>
  );
}

export default function PersonalRoomGuests({ studentId, roomId, isEditing }: Props) {
  const [features, setFeatures] = useState<PersonalFeature[]>([]);

  useEffect(() => {
    let active = true;

    void getStudentPersonalFeatures(studentId).then(result => {
      if (active) setFeatures(result);
    });

    return () => {
      active = false;
    };
  }, [studentId]);

  const guests = features
    .map(feature => ({
      feature,
      config: personalGuestConfigFromFeature(feature),
    }))
    .filter(entry => entry.config !== null)
    .filter(entry => (entry.config?.roomIds ?? ['main']).includes(roomId));

  if (guests.length === 0) return null;

  return (
    <>
      <PersonalRoomGuestStyles />
      {guests.map(({ feature, config }, index) =>
        config ? (
          <PersonalRoomGuest
            key={feature.id}
            config={config}
            index={index}
            isEditing={isEditing}
          />
        ) : null
      )}
    </>
  );
}
