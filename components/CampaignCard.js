import React from 'react';
import { Card, Statistic } from 'semantic-ui-react';

const CampaignCard = ({label, value, color, size}) => {
  return (
    <Card color={color}>
      <Card.Content textAlign={'center'}>
        <Card.Description>
          <Statistic
            color={color}
            size={size}
            style={{width: '100%'}}
          >
            <Statistic.Value style={{wordWrap: 'break-word', textTransform: 'lowercase'}}>{value}</Statistic.Value>
            <Statistic.Label>{label}</Statistic.Label>
          </Statistic>
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

export default CampaignCard;
