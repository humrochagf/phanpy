import './settings.css';

import { Menu, MenuDivider, MenuItem } from '@szhsin/react-menu';
import { useReducer, useState } from 'preact/hooks';

import Avatar from '../components/avatar';
import Icon from '../components/icon';
import Link from '../components/link';
import NameText from '../components/name-text';
import { api } from '../utils/api';
import states from '../utils/states';
import store from '../utils/store';

function Accounts({ onClose }) {
  const { masto } = api();
  // Accounts
  const accounts = store.local.getJSON('accounts');
  const currentAccount = store.session.get('currentAccount');
  const moreThanOneAccount = accounts.length > 1;
  const [currentDefault, setCurrentDefault] = useState(0);

  const [_, reload] = useReducer((x) => x + 1, 0);

  return (
    <div id="settings-container" class="sheet" tabIndex="-1">
      <header class="header-grid">
        <h2>Accounts</h2>
      </header>
      <main>
        <section>
          <ul class="accounts-list">
            {accounts.map((account, i) => {
              const isCurrent = account.info.id === currentAccount;
              const isDefault = i === (currentDefault || 0);
              return (
                <li key={i + account.id}>
                  <div>
                    {moreThanOneAccount && (
                      <span class={`current ${isCurrent ? 'is-current' : ''}`}>
                        <Icon icon="check-circle" alt="Current" />
                      </span>
                    )}
                    <Avatar
                      url={account.info.avatarStatic}
                      size="xxl"
                      onDblClick={async () => {
                        if (isCurrent) {
                          try {
                            const info = await masto.v1.accounts.fetch(
                              account.info.id,
                            );
                            console.log('fetched account info', info);
                            account.info = info;
                            store.local.setJSON('accounts', accounts);
                            reload();
                          } catch (e) {}
                        }
                      }}
                    />
                    <NameText
                      account={account.info}
                      showAcct
                      onClick={() => {
                        if (isCurrent) {
                          states.showAccount = `${account.info.username}@${account.instanceURL}`;
                        } else {
                          store.session.set('currentAccount', account.info.id);
                          location.reload();
                        }
                      }}
                    />
                  </div>
                  <div class="actions">
                    {isDefault && moreThanOneAccount && (
                      <>
                        <span class="tag">Default</span>{' '}
                      </>
                    )}
                    <Menu
                      align="end"
                      menuButton={
                        <button
                          type="button"
                          title="More"
                          class="plain more-button"
                        >
                          <Icon icon="more" size="l" alt="More" />
                        </button>
                      }
                    >
                      <MenuItem
                        onClick={() => {
                          states.showAccount = `${account.info.username}@${account.instanceURL}`;
                        }}
                      >
                        <Icon icon="user" />
                        <span>View profile…</span>
                      </MenuItem>
                      <MenuDivider />
                      {moreThanOneAccount && (
                        <MenuItem
                          disabled={isDefault}
                          onClick={() => {
                            // Move account to the top of the list
                            accounts.splice(i, 1);
                            accounts.unshift(account);
                            store.local.setJSON('accounts', accounts);
                            setCurrentDefault(i);
                          }}
                        >
                          <Icon icon="check-circle" />
                          <span>Set as default</span>
                        </MenuItem>
                      )}
                      <MenuItem
                        disabled={!isCurrent}
                        onClick={() => {
                          const yes = confirm('Log out?');
                          if (!yes) return;
                          accounts.splice(i, 1);
                          store.local.setJSON('accounts', accounts);
                          // location.reload();
                          location.href = '/';
                        }}
                      >
                        <Icon icon="exit" />
                        <span>Log out…</span>
                      </MenuItem>
                    </Menu>
                  </div>
                </li>
              );
            })}
          </ul>
          <p>
            <Link to="/login" class="button plain2" onClick={onClose}>
              <Icon icon="plus" /> <span>Add an existing account</span>
            </Link>
          </p>
          {moreThanOneAccount && (
            <p>
              <small>
                Note: <i>Default</i> account will always be used for first load.
                Switched accounts will persist during the session.
              </small>
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Accounts;
