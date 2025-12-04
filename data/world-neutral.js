/* ================================
   LUCEN OS – NEUTRAL WORLD DATA
   Minimal known-good world
================================ */

window.LucenWorld = {
  masterFields: [
    {
      id: "clarity",
      name: "Clarity Movement",
      short: "Wellbeing • Awareness • Growth",
      fields: [
        {
          id: "clarity-field-1",
          name: "Emotional Clarity",
          short: "Tools for self-awareness",
          modules: [
            {
              id: "clarity-mod-1",
              name: "Breathwork Module",
              short: "Simple daily grounding practice",
              minis: [
                {
                  id: "clarity-mini-1",
                  name: "Daily Reset",
                  body: "A short guided breathing reset sequence."
                },
                {
                  id: "clarity-mini-2",
                  name: "Stress Release",
                  body: "A rhythm-based exhale pattern for nervous-system relief."
                }
              ]
            }
          ]
        }
      ]
    },

    {
      id: "edu",
      name: "Educational Freedom",
      short: "Learning that adapts to the child",
      fields: [
        {
          id: "edu-field-1",
          name: "Core Learning Field",
          short: "Skeleton for home-ed OS",
          modules: [
            {
              id: "edu-mod-1",
              name: "Daily Flow",
              short: "Light structure for the day",
              minis: [
                {
                  id: "edu-mini-1",
                  name: "Morning Check-in",
                  body: "Quick tone-check and intention setting for the day."
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
