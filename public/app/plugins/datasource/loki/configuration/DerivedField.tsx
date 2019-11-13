import React, { useState } from 'react';
import { css } from 'emotion';
import { Button, FormField, VariableSuggestion, DataLinkInput, stylesFactory, Switch } from '@grafana/ui';
import { DerivedFieldConfig } from '../types';
import DataSourcePicker from '../../../../core/components/Select/DataSourcePicker';
import { getDatasourceSrv } from '../../../../features/plugins/datasource_srv';
import { DataSourceSelectItem } from '@grafana/data';

const getStyles = stylesFactory(() => ({
  row: css`
    display: flex;
  `,
  nameField: css`
    flex: 2;
  `,
  regexField: css`
    flex: 3;
  `,
}));

type Props = {
  value: DerivedFieldConfig;
  onChange: (value: DerivedFieldConfig) => void;
  onDelete: () => void;
  suggestions: VariableSuggestion[];
  className?: string;
};
export const DerivedField = (props: Props) => {
  const { value, onChange, onDelete, suggestions, className } = props;
  const styles = getStyles();
  const [hasIntenalLink, setHasInternalLink] = useState(!!value.datasourceName);

  const handleChange = (field: keyof typeof value) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      [field]: event.currentTarget.value,
    });
  };

  const datasources: DataSourceSelectItem[] = getDatasourceSrv()
    .getExternal()
    .map(
      (ds: any) =>
        ({
          value: ds.name,
          name: ds.name,
          meta: ds.meta,
        } as DataSourceSelectItem)
    );
  const selectedDatasource = value.datasourceName && datasources.find(d => d.name === value.datasourceName);

  return (
    <div className={className}>
      <div className={styles.row}>
        <FormField
          className={styles.nameField}
          labelWidth={5}
          // A bit of a hack to prevent using default value for the width from FormField
          inputWidth={null}
          label="Name"
          type="text"
          value={value.name}
          onChange={handleChange('name')}
        />
        <FormField
          className={styles.regexField}
          inputWidth={null}
          label="Regex"
          type="text"
          value={value.matcherRegex}
          onChange={handleChange('matcherRegex')}
          tooltip={
            'Use to parse and capture some part of the log message. You can use the captured groups in the template.'
          }
        />
        <Button
          variant={'inverse'}
          title="Remove field"
          icon={'fa fa-times'}
          onClick={event => {
            event.preventDefault();
            onDelete();
          }}
        />
      </div>

      <FormField
        label="URL"
        labelWidth={5}
        inputEl={
          <DataLinkInput
            placeholder={'http://example.com/${__value.raw}'}
            value={value.url || ''}
            onChange={newValue =>
              onChange({
                ...value,
                url: newValue,
              })
            }
            suggestions={suggestions}
          />
        }
        className={css`
          width: 100%;
        `}
      />

      <div className={styles.row}>
        <Switch
          label="Internal link"
          checked={hasIntenalLink}
          onChange={() => {
            if (hasIntenalLink) {
              onChange({
                ...value,
                datasourceName: undefined,
              });
            }
            setHasInternalLink(!hasIntenalLink);
          }}
        />

        {hasIntenalLink && (
          <DataSourcePicker
            onChange={newValue => {
              onChange({
                ...value,
                datasourceName: newValue.name,
              });
            }}
            datasources={datasources}
            current={selectedDatasource}
          />
        )}
      </div>
    </div>
  );
};
