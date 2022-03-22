import * as React from 'react';
import {
  transactionServices,
  useGetAccountInfo,
  useGetPendingTransactions,
  refreshAccount,
  useGetNetworkConfig
} from '@elrondnetwork/dapp-core';
import {
  Address,
  AddressValue,
  ContractFunction,
  ProxyProvider,
  StringValue,
  Query
} from '@elrondnetwork/erdjs';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { contractAddress } from 'config';

const Actions = () => {
  const account = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { network } = useGetNetworkConfig();
  const { address } = account;

  const [hasVin, setHasVin] = React.useState<boolean>();
  const [hasMeasureUnit, setMeasurUnit] = React.useState<boolean>();
  const /*transactionSessionId*/ [, setTransactionSessionId] = React.useState<
      string | null
    >(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const query = new Query({
      address: new Address(contractAddress),
      func: new ContractFunction('getVIN'),
      args: [new AddressValue(new Address(address))]
    });
    const proxy = new ProxyProvider(network.apiAddress);
    proxy
      .queryContract(query)
      .then(({ returnData }) => {
        const [encoded] = returnData;
        console.log(encoded);
        switch (encoded) {
          case undefined:
            setHasVin(false);
            break;
          case '':
            setHasVin(false);
            break;
          default: {
            setHasVin(true);
            break;
          }
        }
      })
      .catch((err) => {
        console.error('Unable to call VM query', err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPendingTransactions]);

  const { sendTransactions } = transactionServices;

  const sendMileageTransaction = async () => {
    const mileageTransaction = {
      value: '0',
      data: `addMileage@${new Number(7600).toString(16)}`,
      receiver: contractAddress
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: mileageTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Mileage transaction',
        errorMessage: 'An error has occured during addMileage',
        successMessage: 'Mileage transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const sendVinTransaction = async () => {
    const pongTransaction = {
      value: '0',
      data: 'addVIN@76656869636b616c696365',
      receiver: contractAddress
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: pongTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Pong transaction',
        errorMessage: 'An error has occured during Pong',
        successMessage: 'Pong transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  return (
    <div className='d-flex mt-4 justify-content-center'>
      {hasVin && !hasPendingTransactions ? (
        <div className='action-btn' onClick={sendMileageTransaction}>
          <button className='btn'>
            <FontAwesomeIcon icon={faArrowUp} className='text-primary' />
          </button>
          <a href='/' className='text-white text-decoration-none'>
            addMileage
          </a>
        </div>
      ) : (
        <>
          <div className='d-flex flex-column'>
            <div
              {...{
                className: 'action-btn not-allowed disabled'
              }}
            ></div>
          </div>
        </>
      )}
      {!hasVin && !hasPendingTransactions ? (
        <div className='d-flex flex-column'>
          <div className='action-btn' onClick={sendVinTransaction}>
            <button className='btn'>
              <FontAwesomeIcon icon={faArrowUp} className='text-primary' />
            </button>
            <span className='text-white'>
              <a href='/' className='text-white text-decoration-none'>
                Add VIN
              </a>
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className='d-flex flex-column'>
            <div
              {...{
                className: 'action-btn disabled'
              }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
};

export default Actions;
