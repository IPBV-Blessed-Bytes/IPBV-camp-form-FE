import { normalizeProductName } from '@/Pages/Admin/Campers/hooks/useProductCatalog';

const BOOLEAN_FIELDS = ['pastoralFamily', 'contact.car', 'contact.needRide', 'contact.isWhatsApp'];

const applyPackageUpdate = (state, name, rawValue, catalog) => {
  const slugToName = catalog?.slugToName || {};
  const nameToSlug = catalog?.nameToSlug || {};

  const updatePackage = (field) => {
    const normalized = normalizeProductName(rawValue);

    let readable = rawValue;
    let idValue = rawValue;

    if (nameToSlug[normalized]) {
      readable = rawValue;
      idValue = nameToSlug[normalized];
    } else if (slugToName[rawValue]) {
      readable = slugToName[rawValue];
      idValue = rawValue;
    }

    state.package = {
      ...state.package,
      [field]: { ...state.package[field], id: idValue },
      [`${field}Name`]: readable,
    };
  };

  if (name.startsWith('package.accomodation')) {
    updatePackage('accomodation');
  }
  if (name.startsWith('package.transportation')) {
    updatePackage('transportation');
  }
  if (name.startsWith('package.food')) {
    updatePackage('food');
  }
};

export const handleCamperFormChange = (event, setter, catalog) => {
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

    applyPackageUpdate(newState, name, value, catalog);

    return newState;
  });
};
