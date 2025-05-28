import { useState, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { permissions } from '@/fetchers/permissions';
import ColumnFilterWithSelect from '@/components/Admin/CampersTable/ColumnFilterWithSelect';
import ColumnFilterWithTwoValues from '@/components/Admin/CampersTable/ColumnFilterWithTwoValues';
import { useCampersTable } from '@/hooks/useCampersTable';
import Icons from '@/components/Global/Icons';
import ColumnFilter from '@/components/Admin/CampersTable/ColumnFilter';

const useColumns = (userRole, context, selectedRows, rows) => {
  const { handleSelectAll, handleCheckboxChange, handleEditClick, handleDeleteClick, alphabeticalSort } =
    useCampersTable({um: 'um', dois: 'dois', tres: 'tres'});

  const [filteredRows, setFilteredRows] = useState([]);

  console.log('filteredRows2:',filteredRows)


  const columns = useMemo(() => {
    const adminTableEditDeletePermissions = permissions(userRole, context);
    const adminTableDeleteRegistrationsAndSelectRows = permissions(userRole, 'delete-registrations-admin-table');

    return [
      {
        Header: () => (
          <>
            {adminTableDeleteRegistrationsAndSelectRows ? (
              <div className="d-flex justify-content-between w-100">
                <span className="d-flex">
                  <Form.Check
                    className="table-checkbox"
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredRows.length > 0
                        ? selectedRows.length === filteredRows.length
                        : selectedRows.length === rows.length
                    }
                  />
                  &nbsp;
                  {selectedRows.length === 1
                    ? selectedRows.length + ' selecionado'
                    : selectedRows.length > 1
                    ? selectedRows.length + ' selecionados'
                    : 'Selecionar Todos'}
                </span>
              </div>
            ) : (
              'Editar Acampantes'
            )}
          </>
        ),
        accessor: 'selection',
        Filter: '',
        filter: '',
        sortType: 'alphanumeric',
        Cell: ({ row }) => (
          <>
            {adminTableEditDeletePermissions ? (
              <div className="d-flex gap-5">
                {adminTableDeleteRegistrationsAndSelectRows && (
                  <Form.Check
                    className="table-checkbox"
                    type="checkbox"
                    onChange={() => handleCheckboxChange(row.index, row.original.personalInformation.name)}
                    checked={selectedRows.some((selectedRow) => selectedRow.index === row.index)}
                  />
                )}
                <div>
                  <Button variant="outline-success" onClick={() => handleEditClick(row.index)}>
                    <Icons typeIcon="edit" iconSize={24} />
                  </Button>{' '}
                  {adminTableDeleteRegistrationsAndSelectRows && (
                    <Button variant="outline-danger" onClick={() => handleDeleteClick(row.index, row)}>
                      <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              '-'
            )}
          </>
        ),
      },
      {
        Header: 'Ordem:',
        accessor: (_, i) => i + 1,
        disableFilters: true,
        sortType: 'alphanumeric',
      },
      {
        Header: 'Pacote:',
        accessor: (row) =>
          `${row.package.title} ${
            row.package.accomodationName === 'Colegio XV de Novembro'
              ? '[COLÉGIO]'
              : row.package.accomodationName === 'Seminario Sao Jose'
              ? '[SEMINÁRIO]'
              : ''
          } ${
            row.package.transportation === 'Com Ônibus' || row.package.transportation === 'Com Onibus'
              ? 'COM ÔNIBUS'
              : row.package.transportation === 'Sem Ônibus' || row.package.transportation === 'Sem Onibus'
              ? 'SEM ÔNIBUS'
              : ''
          } ${
            row.package.food === 'Café da manhã, almoço e jantar' ||
            row.package.food === 'Café da manhã| almoço e jantar' ||
            row.package.food === 'Cafe da manha, almoco e jantar' ||
            row.package.food === 'Cafe da manha| almoco e jantar' ||
            row.package.food === 'Cafe da manha  almoco e jantar' ||
            row.package.food === 'Almoço e jantar' ||
            row.package.food === 'Almoco e jantar'
              ? 'COM ALIMENTAÇÃO'
              : row.package.food === ''
              ? ''
              : 'SEM ALIMENTAÇÃO'
          }`,
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'Nome:',
        accessor: 'personalInformation.name',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: alphabeticalSort,
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Forma de Pagamento:',
        accessor: 'formPayment.formPayment',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'creditCard', label: 'Cartão de Crédito' },
              { value: 'pix', label: 'PIX' },
              { value: 'boleto', label: 'Boleto Bancário' },
              { value: 'nonPaid', label: 'Não Pagante' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) =>
          value === 'creditCard'
            ? 'Cartão de Crédito'
            : value === 'pix'
            ? 'PIX'
            : value === 'boleto'
            ? 'Boleto Bancário'
            : 'Não pagante',
      },
      {
        Header: 'Igreja:',
        accessor: 'contact.church',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Boa Viagem', label: 'Boa Viagem' },
              { value: 'Outra', label: 'Outra' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Data de Nascimento:',
        accessor: 'personalInformation.birthday',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'CPF:',
        accessor: 'personalInformation.cpf',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'RG:',
        accessor: 'personalInformation.rg',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Órgão Emissor:',
        accessor: (row) =>
          `${row.personalInformation.rgShipper} -
          ${row.personalInformation.rgShipperState}`,
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Tem Vaga de Carona:',
        accessor: (row) => ({
          car: row.contact.car,
          numberVacancies: row.contact.numberVacancies,
        }),
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithRide',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const carText = value.car ? 'Sim' : !value.car ? 'Não' : '-';
          const numberVacanciesText = value.numberVacancies ? value.numberVacancies : '-';
          return `${carText} ${
            numberVacanciesText !== '-' && numberVacanciesText !== '' && numberVacanciesText !== '0'
              ? `| Vagas: ${numberVacanciesText}`
              : ''
          }`;
        },
      },
      {
        Header: 'Precisa de Carona:',
        accessor: 'contact.needRide',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: true, label: 'Sim' },
              { value: false, label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : !value ? 'Não' : '-'),
      },
      {
        Header: 'Observação da Carona:',
        accessor: 'contact.rideObservation',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Data de Inscrição:',
        accessor: 'registrationDate',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
      },
      {
        Header: 'Categoria:',
        accessor: (row) => row.personalInformation.gender?.replace(/ç/g, 'c') || '-',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Homem', label: 'Adulto Masculino' },
              { value: 'Mulher', label: 'Adulto Feminino' },
              { value: 'Crianca', label: 'Criança (até 10 anos)' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/c/g, 'ç') || '-',
      },
      {
        Header: 'Celular:',
        accessor: (row) => ({
          cellPhone: row.contact.cellPhone,
          isWhatsApp: row.contact.isWhatsApp,
        }),
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithCellphone',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const cellPhoneText = value.cellPhone ? value.cellPhone : '-';
          const isWhatsAppText = value.isWhatsApp ? 'Sim' : !value.isWhatsApp ? 'Não' : '-';
          return `${cellPhoneText} ${cellPhoneText !== '-' ? `| Wpp: ${isWhatsAppText}` : ''}`;
        },
      },
      {
        Header: 'Email:',
        accessor: 'contact.email',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Preço:',
        accessor: 'totalPrice',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Alergia:',
        accessor: 'contact.allergy',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Agregados:',
        accessor: 'contact.aggregate',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Acomodação:',
        accessor: (row) =>
          row.package.accomodationName
            ?.replace(/á|ã|à|â/g, 'a')
            .replace(/é|ê/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó|ô/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/ç/g, 'c') || '-',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Colegio XV de Novembro', label: 'Colégio XV de Novembro' },
              { value: 'Seminario Sao Jose', label: 'Seminário São José' },
              { value: 'Outra Acomodacao Externa', label: 'Outra Acomodação Externa' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Sub Acomodação:',
        accessor: (row) =>
          row.package.subAccomodation
            ?.replace(/á|ã|à|â/g, 'a')
            .replace(/é|ê/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó|ô/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/ç/g, 'c') || '-',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Colegio Individual', label: 'Colégio Individual' },
              { value: 'Colegio Familia', label: 'Colégio Família' },
              { value: 'Colegio Camping', label: 'Colégio Camping' },
              { value: 'Seminario', label: 'Seminário' },
              { value: 'Outra', label: 'Outra' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Transporte:',
        accessor: 'package.transportation',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Com Ônibus', label: 'Com Ônibus' },
              { value: 'Sem Ônibus', label: 'Sem Ônibus' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value || '-',
        filter: (rows, id, filterValue) => {
          return rows.filter((row) => {
            const normalizedValue = row.values[id]?.toLowerCase().replace('onibus', 'ônibus');
            return normalizedValue === filterValue.toLowerCase();
          });
        },
      },
      {
        Header: 'Alimentação:',
        accessor: (row) =>
          row.package.food
            ?.replace(/á|ã|à|â/g, 'a')
            .replace(/é|ê/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó|ô/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/ç/g, 'c') || '-',
        Filter: ({ column }) => (
          <ColumnFilterWithSelect
            column={column}
            options={[
              { value: 'Almoco e jantar', label: 'Com Alimentação' },
              { value: 'Sem Alimentacao', label: 'Sem Alimentação' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Refeição Extra:',
        accessor: (row) => ({
          someFood: row.extraMeals.someFood,
          extraMeals: Array.isArray(row.extraMeals.extraMeals)
            ? row.extraMeals.extraMeals
            : [row.extraMeals.extraMeals],
        }),
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithExtraMeals',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const someFoodText = value.someFood ? 'Sim' : !value.someFood ? 'Não' : '-';
          const extraMealsText =
            !value.extraMeals || (Array.isArray(value.extraMeals) && value.extraMeals.every((item) => item === ''))
              ? '-'
              : Array.isArray(value.extraMeals)
              ? value.extraMeals.filter(Boolean).join(', ')
              : '-';

          return `${someFoodText} ${extraMealsText !== '-' ? `| Dias: ${extraMealsText}` : ''}`;
        },
      },
      {
        Header: 'Observação:',
        accessor: 'observation',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => value.replace(/\|/g, ', ') || '-',
      },
      {
        Header: 'Desconto:',
        accessor: (row) => ({
          discountCoupon: row.package.discountCoupon,
          discountValue: row.package.discountValue,
        }),
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithCoupon',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const hasDiscount = value.discountCoupon ? 'Sim' : !value.discountCoupon ? 'Não' : '-';
          const discountValueText = value.discountValue !== '0' ? value.discountValue : '-';
          return `${hasDiscount} ${
            discountValueText !== '-' && discountValueText !== '' ? `| Valor: ${discountValueText}` : ''
          }`;
        },
      },
      {
        Header: 'Chave do Pedido:',
        accessor: 'orderId',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const orderUrl = `https://dash.pagar.me/merch_Al154387U9uZDPV2/acc_5d3nayjiPBsdGnA0/orders/${value}`;

          return value ? (
            <a href={orderUrl} className="order-url" target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          ) : (
            '-'
          );
        },
      },
      {
        Header: 'Check-in:',
        accessor: (row) => ({
          checkin: row.checkin,
          checkinTime: row.checkinTime,
        }),
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithCheckin',
        sortType: 'alphanumeric',
        Cell: ({ value }) => {
          const checkinText = value.checkin ? 'Sim' : 'Não';
          const checkinTimeText = value.checkinTime ? value.checkinTime : '-';

          const checkinTimeTextSplited = checkinTimeText !== '-' ? checkinTimeText.split(' ') : null;
          const checkinTimeTextPt1 = checkinTimeTextSplited ? checkinTimeTextSplited[0] : '-';
          const checkinTimeTextPt2 = checkinTimeTextSplited ? checkinTimeTextSplited[1] : '-';

          return `${checkinText} ${
            checkinText !== 'Não' && checkinTimeText !== '-'
              ? `| Em ${checkinTimeTextPt1} às ${checkinTimeTextPt2}`
              : ''
          }`;
        },
      },
      {
        Header: 'Equipe:',
        accessor: 'crew',
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithCrew',
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : !value ? 'Não' : '-'),
      },
      {
        Header: 'Inscrição Manual:',
        accessor: 'manualRegistration',
        Filter: ({ column }) => (
          <ColumnFilterWithTwoValues
            column={column}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'não', label: 'Não' },
            ]}
            onFilterChange={() => {
              setFilteredRows(column.filteredRows);
            }}
          />
        ),
        filter: 'selectWithManualRegistration',
        sortType: 'alphanumeric',
        Cell: ({ value }) => (value ? 'Sim' : !value ? 'Não' : '-'),
      },
      {
        Header: `${adminTableDeleteRegistrationsAndSelectRows ? 'Editar / Deletar' : 'Editar Acampantes'}`,
        Cell: ({ row }) => (
          <>
            {adminTableEditDeletePermissions ? (
              <div>
                <Button variant="outline-success" onClick={() => handleEditClick(row.index)}>
                  <Icons typeIcon="edit" iconSize={24} />
                </Button>{' '}
                {adminTableDeleteRegistrationsAndSelectRows && (
                  <Button variant="outline-danger" onClick={() => handleDeleteClick(row.index, row)}>
                    <Icons typeIcon="delete" iconSize={24} fill="#dc3545" />
                  </Button>
                )}
              </div>
            ) : (
              '-'
            )}
          </>
        ),
        disableFilters: true,
      },
    ];
  }, [
    userRole,
    context,
    selectedRows,
    filteredRows,
    handleSelectAll,
    handleCheckboxChange,
    handleEditClick,
    handleDeleteClick,
    alphabeticalSort,
    rows.length
  ]);

  return { columns, filteredRows, setFilteredRows };
};

export default useColumns;
