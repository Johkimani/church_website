const isGentMember = (g) => ["gent", "male", "man", "boy", "m"].includes(String(g || "").trim().toLowerCase());
const isLadyMember = (g) => ["lady", "female", "woman", "girl", "f"].includes(String(g || "").trim().toLowerCase());

export const distributeMembers = ({
  members,
  groups,
  strategy = "balanced-mixed",
}) => {
  if (!members.length || !groups.length) {
    return { assignments: [], stats: null };
  }

  const gentMembers = members.filter(m => isGentMember(m.gender));
  const ladyMembers = members.filter(m => isLadyMember(m.gender));
  const otherMembers = members.filter(m => !isGentMember(m.gender) && !isLadyMember(m.gender));

  let assignments = [];

  if (strategy === "gender-separate") {
    const gentGroups = groups.filter(g => g.group_type === "male");
    const ladyGroups = groups.filter(g => g.group_type === "female");
    const mixedGroups = groups.filter(g => g.group_type === "mixed");

    assignments = [
      ...assignToGroups(gentMembers, gentGroups),
      ...assignToGroups(ladyMembers, ladyGroups),
      ...assignToGroups(otherMembers, mixedGroups),
    ];
  } else {
    assignments = assignToGroupsBalanced(members, groups);
  }

  const stats = {
    totalMembers: members.length,
    totalGroups: groups.length,
    maleCount: gentMembers.length,
    femaleCount: ladyMembers.length,
    assignmentsByGroup: groups.map(g => ({
      groupId: g.id,
      groupName: g.group_name,
      count: assignments.filter(a => a.group_id === g.id).length,
    })),
  };

  return { assignments, stats };
};

const assignToGroups = (members, groups) => {
  if (!groups.length) return [];
  const assignments = [];
  const capacityPerGroup = Math.ceil(members.length / groups.length);

  members.forEach((member, index) => {
    const groupIndex = Math.min(Math.floor(index / capacityPerGroup), groups.length - 1);
    assignments.push({
      member_id: member.id,
      group_id: groups[groupIndex].id,
      member_name: member.name,
      group_name: groups[groupIndex].group_name,
    });
  });

  return assignments;
};

const assignToGroupsBalanced = (members, groups) => {
  if (!groups.length) return [];
  const assignments = [];
  const groupSlots = groups.map(g => ({
    ...g,
    maleCount: 0,
    femaleCount: 0,
    currentSize: 0,
    capacity: g.capacity || Math.ceil(members.length / groups.length),
  }));

  const shuffled = [...members].sort(() => Math.random() - 0.5);
  const gentMembers = shuffled.filter(m => isGentMember(m.gender));
  const ladyMembers = shuffled.filter(m => isLadyMember(m.gender));
  const others = shuffled.filter(m => !isGentMember(m.gender) && !isLadyMember(m.gender));

  const distributeGender = (pool, isGent) => {
    pool.forEach((member) => {
      const target = groupSlots
        .filter(g => g.currentSize < g.capacity)
        .sort((a, b) => {
          const aCount = isGent ? a.maleCount : a.femaleCount;
          const bCount = isGent ? a.maleCount : b.femaleCount;
          if (aCount !== bCount) return aCount - bCount;
          return a.currentSize - b.currentSize;
        })[0];

      if (target) {
        if (isGent) target.maleCount++;
        else target.femaleCount++;
        target.currentSize++;
        assignments.push({
          member_id: member.id,
          group_id: target.id,
          member_name: member.name,
          group_name: target.group_name,
        });
      }
    });
  };

  distributeGender(gentMembers, true);
  distributeGender(ladyMembers, false);
  distributeGender(others, false);

  return assignments;
};

export const generateGroupNames = (count, baseName = "Team") => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: count }, (_, i) => ({
    name: `${baseName} ${letters[i]}`,
    type: "mixed",
    capacity: 0,
  }));
};
