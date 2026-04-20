const ACCOMODATION_MAP = {
  'host-college-collective': 'Colégio Quarto Coletivo',
  'host-college-family': 'Colégio Quarto Família',
  'host-college-camping': 'Colégio Camping',
  'host-seminario': 'Seminário',
  'host-external': 'Externo',
};

const TRANSPORTATION_MAP = {
  'bus-yes': 'Com Ônibus',
  'bus-no': 'Sem Ônibus',
};

const FOOD_MAP = {
  'food-complete': 'Alimentação Completa',
  'no-food': 'Sem Alimentação',
};

const BOOLEAN_FIELDS = ['pastoralFamily', 'contact.car', 'contact.needRide', 'contact.isWhatsApp'];

const normalizeText = (str) =>
  str
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .trim();

const reverseMap = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [normalizeText(v), k]));

const REVERSE_ACCOMODATION = reverseMap(ACCOMODATION_MAP);
const REVERSE_TRANSPORTATION = reverseMap(TRANSPORTATION_MAP);
const REVERSE_FOOD = reverseMap(FOOD_MAP);

const applyPackageUpdate = (state, name, rawValue) => {
  const updatePackage = (field, map, reverse) => {
    const normalized = normalizeText(rawValue);
    const isReadable = Object.values(map).some((v) => normalizeText(v) === normalized);

    const readable = isReadable ? rawValue : map[rawValue] || rawValue;
    const idValue = isReadable ? reverse[normalized] : rawValue;

    state.package = {
      ...state.package,
      [field]: { ...state.package[field], id: idValue },
      [`${field}Name`]: readable,
    };
  };

  if (name.startsWith('package.accomodation')) {
    updatePackage('accomodation', ACCOMODATION_MAP, REVERSE_ACCOMODATION);
  }
  if (name.startsWith('package.transportation')) {
    updatePackage('transportation', TRANSPORTATION_MAP, REVERSE_TRANSPORTATION);
  }
  if (name.startsWith('package.food')) {
    updatePackage('food', FOOD_MAP, REVERSE_FOOD);
  }
};

export const handleCamperFormChange = (event, setter) => {
  const { name, value } = event.target;
  const keys = name.split('.');
  const adjustedValue = value === '' ? '' : value;
  const booleanValue = BOOLEAN_FIELDS.includes(name) ? adjustedValue === 'true' : adjustedValue;

  setter((prev) => {
    const newState = { ...prev };

    if (keys.length === 3) {
      const [grandParent, parent, child] = keys;
      newState[grandParent] = {
        ...prev[grandParent],
        [parent]: {
          ...prev[grandParent]?.[parent],
          [child]: booleanValue,
        },
      };
      const mirrorField = `${parent}Name`;
      if (Object.prototype.hasOwnProperty.call(prev[grandParent] || {}, mirrorField)) {
        newState[grandParent][mirrorField] = booleanValue;
      }
    } else if (keys.length === 2) {
      const [parent, child] = keys;
      newState[parent] = { ...prev[parent], [child]: booleanValue };
    } else {
      newState[name] = booleanValue;
    }

    applyPackageUpdate(newState, name, value);

    return newState;
  });
};
