import { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Accordion } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';
import {
  getHomeInfo,
  createHomeInfo,
  updateHomeInfo,
  deleteHomeInfo,
  deleteOnDemandHomeInfo,
} from '@/services/homeInfo';
import { registerLog } from '@/services/logs';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import CustomEditor from '@/components/Global/CustomEditor';
import { iconsOptions } from '@/utils/constants';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import FormSection from '@/components/Admin/FormSection';

const sortedIconsOptions = [...iconsOptions].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

const STROKE_ICONS = ['roles', 'phone', 'visible-password'];

const iconColorProps = (icon) =>
  STROKE_ICONS.includes(icon) ? { stroke: '#007185', fill: 'none' } : { fill: '#007185' };

const AdminHomeInfoManagement = ({ loggedUsername }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [showNewBottomForm, setShowNewBottomForm] = useState(false);
  const [openItems, setOpenItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState(null);

  const [newBottomItem, setNewBottomItem] = useState({
    id: 0,
    icon: '',
    title: '',
    description: '',
  });

  const [formData, setFormData] = useState({
    top: {
      title: '',
      subtitle: '',
      locationAndDate: '',
      place: '',
      speaker: '',
      registrationsDeadline: '',
    },
    bottom: [],
  });

  const [editing, setEditing] = useState(false);

  scrollUp();

  const fetchHomepageInfo = async () => {
    try {
      setLoading(true);
      const data = await getHomeInfo();

      if (data) {
        setFormData({
          ...data,
          bottom:
            data.bottom?.map((item) => ({
              id: item.id ?? 0,
              icon: item.icon,
              title: item.title,
              description: item.description,
            })) || [],
        });
        setEditing(true);
      }
    } catch (error) {
      console.error(error);
      toast.error(t('admin.homeInfo.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageInfo();
  }, []);

  const handleTopChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      top: {
        ...prev.top,
        [field]: value,
      },
    }));
  };

  const handleBottomChange = (index, field, value) => {
    const updatedBottom = [...formData.bottom];
    updatedBottom[index] = {
      ...updatedBottom[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      bottom: updatedBottom,
    }));
  };

  const handleCreateBottomItem = async () => {
    if (!newBottomItem.icon || !newBottomItem.title) {
      toast.error(t('admin.homeInfo.iconTitleRequired'));
      return;
    }

    const newItem = {
      ...newBottomItem,
      id: Date.now(),
    };

    try {
      setLoadingContent(true);

      const payload = {
        bottom: [newItem],
      };

      await createHomeInfo(payload);

      toast.success(t('admin.homeInfo.itemAdded'));
      registerLog('Adicionou item bottom', loggedUsername);

      setNewBottomItem({
        id: 0,
        icon: '',
        title: '',
        description: '',
      });

      setShowNewBottomForm(false);

      fetchHomepageInfo();
    } catch (error) {
      console.error(error);
      toast.error(t('admin.homeInfo.itemSaveError'));
    } finally {
      setLoadingContent(false);
    }
  };

  const handleRemoveBottomItem = async (index) => {
    const itemToRemove = formData.bottom[index];

    if (!itemToRemove.id) {
      const updatedBottom = formData.bottom.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, bottom: updatedBottom }));
      return;
    }

    try {
      setLoadingContent(true);

      const payload = {
        top: formData.top,
        bottom: [{ id: itemToRemove.id }],
      };

      await deleteOnDemandHomeInfo(payload);

      toast.success(t('admin.homeInfo.itemRemoved'));
      registerLog('Removeu item bottom', loggedUsername);

      const updatedBottom = formData.bottom.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, bottom: updatedBottom }));
    } catch (error) {
      console.error(error);
      toast.error(t('admin.homeInfo.itemRemoveError'));
    } finally {
      setLoadingContent(false);
    }
  };

  const handleUpdateBottomItem = async (index) => {
    const itemToUpdate = formData.bottom[index];

    try {
      setLoadingContent(true);
      const payload = {
        top: formData.top,
        bottom: [
          {
            id: itemToUpdate.id,
            icon: itemToUpdate.icon,
            title: itemToUpdate.title,
            description: itemToUpdate.description,
          },
        ],
      };
      await updateHomeInfo(payload);

      toast.success(t('admin.homeInfo.itemUpdated'));
      registerLog('Editou item bottom', loggedUsername);

      fetchHomepageInfo();
    } catch (error) {
      console.error(error);
      toast.error(t('admin.homeInfo.itemUpdateError'));
    } finally {
      setLoadingContent(false);
    }
  };

  const confirmRemoveBottomItem = (index) => {
    setItemToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteItem = async () => {
    if (itemToDeleteIndex === null) return;

    await handleRemoveBottomItem(itemToDeleteIndex);

    setItemToDeleteIndex(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDeleteAll = async () => {
    await handleDeleteAll();
    setShowDeleteAllModal(false);
  };

  const handleSubmit = async () => {
    try {
      setLoadingContent(true);

      if (editing) {
        const payload = {
          top: formData.top,
          bottom: formData.bottom.map((item) => ({
            id: item.id ?? 0,
            icon: item.icon,
            title: item.title,
            description: item.description,
          })),
        };
        await updateHomeInfo(payload);
        toast.success(t('admin.homeInfo.homeUpdated'));
        registerLog('Editou informações da homepage', loggedUsername);
      } else {
        await createHomeInfo(formData);
        toast.success(t('admin.homeInfo.homeCreated'));
        registerLog('Criou informações da homepage', loggedUsername);
      }

      fetchHomepageInfo();
    } catch (error) {
      console.error(error);
      toast.error(t('admin.homeInfo.saveError'));
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setLoadingContent(true);

      await deleteHomeInfo();
      toast.success(t('admin.homeInfo.infoRemoved'));
      registerLog('Removeu informações da homepage', loggedUsername);

      setFormData({
        top: {
          title: '',
          subtitle: '',
          locationAndDate: '',
          place: '',
          speaker: '',
          registrationsDeadline: '',
        },
        bottom: [],
      });

      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(t('admin.homeInfo.infoRemoveError'));
    } finally {
      setLoadingContent(false);
    }
  };

  const topFieldsConfig = {
    title: {
      label: t('admin.homeInfo.fields.title.label'),
      placeholder: t('admin.homeInfo.fields.title.placeholder'),
    },
    subtitle: {
      label: t('admin.homeInfo.fields.subtitle.label'),
      placeholder: t('admin.homeInfo.fields.subtitle.placeholder'),
    },
    locationAndDate: {
      label: t('admin.homeInfo.fields.locationAndDate.label'),
      placeholder: t('admin.homeInfo.fields.locationAndDate.placeholder'),
    },
    place: {
      label: t('admin.homeInfo.fields.place.label'),
      placeholder: t('admin.homeInfo.fields.place.placeholder'),
    },
    speaker: {
      label: t('admin.homeInfo.fields.speaker.label'),
      placeholder: t('admin.homeInfo.fields.speaker.placeholder'),
    },
    registrationsDeadline: {
      label: t('admin.homeInfo.fields.registrationsDeadline.label'),
      placeholder: t('admin.homeInfo.fields.registrationsDeadline.placeholder'),
    },
  };

  const topFieldKeys = Object.keys(formData.top);
  const filledTopCount = topFieldKeys.filter((field) => String(formData.top[field] ?? '').trim()).length;
  const statItems = [
    { label: t('admin.homeInfo.statBaseFilled'), value: `${filledTopCount}/${topFieldKeys.length}` },
    { label: t('admin.homeInfo.statImportantInfo'), value: formData.bottom.length, tone: 'info' },
    {
      label: t('admin.homeInfo.statStatus'),
      value: editing ? t('admin.homeInfo.statusPublished') : t('admin.homeInfo.statusNotCreated'),
      tone: editing ? 'free' : 'used',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--settings">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.homeInfo.title')}
        subtitle={t('admin.homeInfo.subtitle')}
        typeIcon="simple-info"
      />

      <div className="admin-subpage__content">
        <StatCards items={statItems} />

        <Row className="g-4">
        <Col xs={12} lg={5} xl={4}>
          <FormSection title={t('admin.homeInfo.baseInfoTitle')} description={t('admin.homeInfo.baseInfoDesc')}>
            {Object.keys(formData.top).map((field) => (
              <Form.Group key={field} className="mt-2">
                <Form.Label>{topFieldsConfig[field].label}</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.top[field]}
                  placeholder={topFieldsConfig[field].placeholder}
                  onChange={(e) => handleTopChange(field, e.target.value)}
                />
              </Form.Group>
            ))}

            <div className="d-flex mt-3 justify-content-end gap-2">
              <Button type="button" variant="teal-blue" onClick={handleSubmit}>
                {editing ? t('admin.homeInfo.saveChanges') : t('admin.homeInfo.createHomepage')}
              </Button>
            </div>
          </FormSection>
        </Col>

        <Col xs={12} lg={7} xl={8}>
          <FormSection>
            <div className="homeinfo-section-head">
              <h2 className="admin-form-section__title homeinfo-section-head__title mb-0">{t('admin.homeInfo.importantTitle')}</h2>
              <div className="homeinfo-section-head__actions">
                <Button
                  variant="outline-teal-blue"
                  className="d-flex align-items-center"
                  onClick={() => setShowNewBottomForm(true)}
                >
                  <Icons typeIcon="plus" iconSize={16} fill="#007185" />
                  &nbsp;{t('admin.homeInfo.add')}
                </Button>
                <Button
                  variant="danger"
                  className="d-flex align-items-center"
                  onClick={() => setShowDeleteAllModal(true)}
                >
                  <Icons typeIcon="danger" iconSize={16} fill="#fff" />
                  &nbsp;{t('admin.homeInfo.clearFields')}
                </Button>
              </div>
            </div>

            {showNewBottomForm && (
              <div className="homeinfo-new-item">
                <Form.Group className="mt-2">
                  <Form.Label>{t('admin.homeInfo.iconLabel')}</Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Select
                      value={newBottomItem.icon}
                      onChange={(e) => setNewBottomItem({ ...newBottomItem, icon: e.target.value })}
                    >
                      <option value="" disabled>
                        {t('admin.homeInfo.selectIcon')}
                      </option>
                      {sortedIconsOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>

                    {newBottomItem.icon && (
                      <div className="icon-preview">
                        <Icons typeIcon={newBottomItem.icon} iconSize={20} />
                      </div>
                    )}
                  </div>
                </Form.Group>

                <Form.Group className="mt-2">
                  <Form.Label>{t('admin.homeInfo.titleLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={newBottomItem.title}
                    onChange={(e) => setNewBottomItem({ ...newBottomItem, title: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mt-2">
                  <Form.Label>{t('admin.homeInfo.descriptionLabel')}</Form.Label>

                  <CustomEditor
                    value={newBottomItem.description}
                    onChange={(value) =>
                      setNewBottomItem((prev) => ({
                        ...prev,
                        description: value,
                      }))
                    }
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="secondary" onClick={() => setShowNewBottomForm(false)}>
                    {t('admin.homeInfo.cancel')}
                  </Button>

                  <Button variant="teal-blue" onClick={handleCreateBottomItem}>
                    {t('admin.homeInfo.saveItem')}
                  </Button>
                </div>
              </div>
            )}

            <Accordion
              className="homeinfo-custom-accordion"
              alwaysOpen
              activeKey={openItems}
              onSelect={(keys) => setOpenItems(keys || [])}
            >
              {formData.bottom.map((item, index) => (
                <Accordion.Item eventKey={String(index)} key={item.id}>
                  <Accordion.Header>
                    <div className="d-flex align-items-center gap-2">
                      {item.icon && <Icons typeIcon={item.icon} iconSize={18} {...iconColorProps(item.icon)} />}
                      <span>{item.title || t('admin.homeInfo.itemFallback', { num: index + 1 })}</span>
                    </div>
                  </Accordion.Header>

                  <Accordion.Body>
                    <Form.Group className="mt-2">
                      <Form.Label>{t('admin.homeInfo.iconLabel')}</Form.Label>

                      <div className="d-flex align-items-center gap-2">
                        <Form.Select
                          value={item.icon || ''}
                          onChange={(e) => handleBottomChange(index, 'icon', e.target.value)}
                        >
                          <option value="" disabled>
                            {t('admin.homeInfo.selectIcon')}
                          </option>

                          {sortedIconsOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>

                        {item.icon && (
                          <div className="icon-preview">
                            <Icons typeIcon={item.icon} iconSize={20} />
                          </div>
                        )}
                      </div>
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label>{t('admin.homeInfo.titleLabel')}</Form.Label>
                      <Form.Control
                        type="text"
                        value={item.title}
                        onChange={(e) => handleBottomChange(index, 'title', e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label>{t('admin.homeInfo.descriptionLabel')}</Form.Label>
                      {openItems.includes(String(index)) && (
                        <CustomEditor
                          value={item.description}
                          onChange={(value) => handleBottomChange(index, 'description', value)}
                        />
                      )}
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <Button variant="outline-danger" size="sm" onClick={() => confirmRemoveBottomItem(index)}>
                        {t('admin.homeInfo.remove')}
                      </Button>

                      <Button variant="teal-blue" size="sm" onClick={() => handleUpdateBottomItem(index)}>
                        {t('admin.homeInfo.save')}
                      </Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </FormSection>
        </Col>
      </Row>

      <CustomModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        variant="cancel"
        title={t('admin.homeInfo.deleteItemTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('admin.homeInfo.cancel')}
            </Button>
            <Button className="btn-cancel" variant="danger" onClick={handleConfirmDeleteItem}>
              {t('admin.homeInfo.remove')}
            </Button>
          </>
        }
      >
        {t('admin.homeInfo.deleteItemConfirm')}
      </CustomModal>

      <CustomModal
        show={showDeleteAllModal}
        onHide={() => setShowDeleteAllModal(false)}
        variant="cancel"
        title={t('admin.homeInfo.deleteAllTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>
              {t('admin.homeInfo.cancel')}
            </Button>
            <Button className="btn-cancel" variant="danger" onClick={handleConfirmDeleteAll}>
              {t('admin.homeInfo.removeAll')}
            </Button>
          </>
        }
      >
        {t('admin.homeInfo.deleteAllConfirm')}
      </CustomModal>

        <Loading loading={loading || loadingContent} />
      </div>
    </div>
  );
};

AdminHomeInfoManagement.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminHomeInfoManagement;
