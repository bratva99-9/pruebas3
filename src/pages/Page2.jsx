import React, { useState } from 'react';
import { UserService } from '../UserService';

const Page2 = () => {
    const [amount, setAmount] = useState('1.00000000');
    const [recipient, setRecipient] = useState('3dkrenderwax');

    const onHandleSendWax = () => {
        if (!UserService.isLogged()) {
            alert('You must log in to transfer WAX.');
            return;
        }
        if (!amount || isNaN(parseFloat(amount))) {
            alert('Please enter a valid amount.');
            return;
        }
        if (!recipient || recipient.length < 5 || recipient.length > 12) {
            alert('Please enter a valid recipient account.');
            return;
        }

        UserService.session.signTransaction(
            {
                actions: [{
                    account: 'eosio.token',
                    name: 'transfer',
                    authorization: [{
                        actor: UserService.authName,
                        permission: 'active'
                    }],
                    data: {
                        from: UserService.authName,
                        to: recipient,
                        quantity: `${parseFloat(amount).toFixed(8)} WAX`,
                        memo: 'Custom transfer'
                    }
                }]
            },
            {
                blocksBehind: 3,
                expireSeconds: 30
            }
        ).then((response) => {
            if(response && response.processed && response.processed.receipt && response.processed.receipt.status === 'executed') {
                UserService.getBalance();
                alert('Transaction sent successfully');
            } else {
                alert('There was a problem with the transaction.');
            }
        }).catch((error) => {
            alert('Error sending transaction: ' + (error && error.message ? error.message : error));
        });
    }

    return (
        <div className="container text-white text-center mt-5">
            <h1>Custom Transfer</h1>
            <input 
                className="form-control mt-3" 
                type="text" 
                placeholder="WAX Amount" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <input 
                className="form-control mt-3" 
                type="text" 
                placeholder="Recipient account" 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
            />
            <button className="btn btn-success btn-lg mt-3" onClick={onHandleSendWax}>
                Send WAX
            </button>
        </div>
    );
};

export default Page2;