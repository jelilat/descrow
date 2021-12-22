
import {
  depositNativeToken,
  initNativeTransaction,
  withdrawNativeTransaction,
  cancelNativeTransaction,
  pauseNativeTransaction,
  resumeNativeTransaction,
  withdrawNativeTokenDeposit,
} from "zebecprotocol-sdk";
import faunadb from 'faunadb';
// import FAUNA_KEY from '../appKeys';
import dotenv from 'dotenv';
import { start } from "repl";
const env = dotenv.config();

const faunaKey = env.FAUNA_KEY;

var client = new faunadb.Client({
    secret: faunaKey
  })

// //var faunadb = (window as any).faunadb;
var q = faunadb.query

let walletAddress: string;

const walletConnect = document.getElementById('connect') as HTMLButtonElement
const streamPayment = document.getElementById('create') as HTMLButtonElement
const pmessage = document.getElementById('pmessage') as HTMLParagraphElement
const nmessage = document.getElementById('nmessage') as HTMLParagraphElement
const deposit = document.getElementById('deposit') as HTMLButtonElement
const pause = document.getElementById('pause') as HTMLButtonElement
const resume = document.getElementById('resume') as HTMLButtonElement
const cancel = document.getElementById('cancel') as HTMLButtonElement
const projects = document.getElementById('projectTable') as HTMLTableElement
const _pmessage = document.getElementById('_pmessage') as HTMLParagraphElement
const _nmessage = document.getElementById('_nmessage') as HTMLParagraphElement

walletConnect.onclick = async () => {
    const isPhantomInstalled = (window as any).solana && (window as any).solana.isPhantom
    
    walletAddress = await getProvider()
    let truncWalletAddress = walletAddress.slice(0,6) + "..." + walletAddress.slice(-4)
    console.log(truncWalletAddress)
    walletConnect.innerHTML = truncWalletAddress;
    let data = await getProjectsByAddress(walletAddress)
    let tableHtml = await constructTable(data)

    projects.innerHTML = tableHtml
}

deposit.onclick = async () => {
    if (walletAddress === undefined) {
        await getProvider()
    }

    let depositToken = document.getElementById('depositToken') as HTMLInputElement
    let tokenAmount = depositToken.value;
    let amount = parseFloat(tokenAmount);

    await depositTransac(amount)
}

streamPayment.onclick = async () => {
    
    if (walletAddress === "" || walletAddress === undefined) {
        await getProvider()
    } 
    
    let get_balance = await getBalance()
    
    if (get_balance !== undefined) {
        let balance = get_balance["data"]["amount"];
        let ref = get_balance["ref"]["value"]["id"];
        
        let token = document.getElementById('token') as HTMLInputElement
        let amount = parseFloat(token.value);
        
        if (balance < amount) {
            _nmessage.innerHTML = "Insufficient funds. Deposit more tokens."
        } else {
            let newBalance = balance - amount;
            await sendTransac(ref, newBalance)
        }
    } else {
        _nmessage.innerHTML = "Insufficient funds. Deposit more tokens."
    }    

}

pause.onclick = async () => {
    if (walletAddress === "" || walletAddress === undefined) {
        await getProvider()
    }

    let pda = document.getElementById('pausePda') as HTMLInputElement
    let pausePda = pda.value;

    let get_project = await getProjects(pausePda)
    if (get_project !== undefined) {
        let receiver_address = get_project["data"]["receiverAddress"];
        await pauseTransac(pausePda, receiver_address)
        .then(async (response: any) => {
            let ref = get_project["ref"]["value"]["id"];
            await updateProjects(ref, "paused")
             
            pmessage.innerHTML = response.message
        })
        .catch((error: any) => {
            nmessage.innerHTML = error.message
        }
        );
    } else {
        nmessage.innerHTML = "Project not found."
    }
}

resume.onclick = async () => {
    if (walletAddress === "" || walletAddress === undefined) {
        await getProvider()
    }

    let pda = document.getElementById('resumePda') as HTMLInputElement
    let resumePda = pda.value;

    let get_project = await getProjects(resumePda)
    if (get_project !== undefined) {
        let receiver_address = get_project["data"]["receiverAddress"];
        await resumeTransac(resumePda, receiver_address)
        .then(async (response: any) => {
            let ref = get_project["ref"]["value"]["id"];
            await updateProjects(ref, "active")
             
            pmessage.innerHTML = response.message
        })
        .catch((response: any) => {
            console.log(response.message)
            nmessage.innerHTML = response.message
        }
        );
    } else {
        nmessage.innerHTML = "Project not found."
    }
}

cancel.onclick = async () => {
    if (walletAddress === "" || walletAddress === undefined) {
        await getProvider()
    }

    let pda = document.getElementById('cancelPda') as HTMLInputElement
    let cancelPda = pda.value;

    let get_project = await getProjects(cancelPda)
   
    if (get_project !== undefined) {
        let receiver_address = get_project["data"]["receiverAddress"];
        await cancelTransac(cancelPda, receiver_address)
        .then(async (response: any) => {
            let ref = get_project["ref"]["value"]["id"];
            await updateProjects(ref, "active")
             
            pmessage.innerHTML = response.message
        })
        .catch((response: any) => {
            nmessage.innerHTML = response.message
        }
        );
    } else {
        nmessage.innerHTML = "Project not found."
    }
    
}

const getProvider = async () => {
    if ("solana" in (window as any)) {
      const provider = (window as any).solana;
      if (provider.isPhantom) {
        const response = await (window as any).solana.connect();
        walletAddress = response.publicKey.toString()
        console.log(
        'Connected with Public Key:',
        walletAddress
        );
        return walletAddress;
      }
    }
    (window as any).open("https://phantom.app/", "_blank");
  };

  const depositTransac = async (amount: number) => {
    
    const data = {
      sender: walletAddress, // wallet public key
      amount: amount,
    };
  
    await depositNativeToken(data)
    .then(async (response: any) => {
        console.log(response)
        let get_balance = await getBalance()
        let balance = get_balance["data"]["amount"];
        amount = amount + balance;
        let ref = get_balance["ref"]["value"]["id"];
        await updateBalance(ref, amount)
        _pmessage.innerHTML = response.message
    })
    .catch((response: any) => {
        _nmessage.innerHTML = response.message
        recordBalance(amount)
    });
  };

  const sendTransac = async (ref, newBalance) => {
    let token = document.getElementById('token') as HTMLInputElement
    let amount = parseFloat(token.value);
    let recipient = document.getElementById('recipient') as HTMLInputElement
    let receiver = recipient.value
    
    let start = document.getElementById('start') as HTMLInputElement
    let startTime = start.value;
    let unixStartTime = Math.round(new Date(startTime).getTime() / 1000);
    
    let end = document.getElementById('end') as HTMLInputElement
    let endTime = end.value;
    let unixEndTime = Math.round(new Date(endTime).getTime() / 1000);

    const data = {
      sender: walletAddress,
      receiver: receiver,
      amount: amount,
      start: unixStartTime, // epoch time stamp (unix)
      end: unixEndTime,
    };
    await initNativeTransaction(data)
    .then(async (response: any) => {
        _pmessage.innerHTML = response.message
        let pda = response.data.pda;
        await recordProjects(pda, receiver, unixStartTime, unixEndTime, amount, "active")
        await updateBalance(ref, newBalance)
    })
    .catch((error: any) => {
        console.log(error)
        _nmessage.innerHTML = error.message
    });
  };

const pauseTransac = async (pausePda, receiver_address) => {
    const data = {
      sender: walletAddress,
      receiver: receiver_address,
      pda: pausePda, // use saved pda returned from initNativeTransaction()
    };
    const response = await pauseNativeTransaction(data);
    console.log(response);
  };

  const resumeTransac = async (resumePda, receiver_address) => {
    const data = {
      sender: walletAddress,
      receiver: receiver_address,
      pda: resumePda,
    };
    const response = await resumeNativeTransaction(data);
  };

  const cancelTransac = async (cancelPda, receiver_address) => {
    const data = {
      sender: walletAddress,
      receiver: receiver_address,
      pda: cancelPda,
    };
  
    const response = await cancelNativeTransaction(data);
  };

  const withTransac = async () => {
    const data = {
      sender: "J75jd3kjsABQSDrEdywcyhmbq8eHDowfW9xtEWsVALy9",
      receiver: "FuEm7UMaCYHThzKaf9DcJ7MdM4t4SALfeNnYQq46foVv",
      pda: "3AicfRtVVXzkjU5L3yarWt2oMWSS32jfkPeeK5Hh9Hyz",
      amount: 0.5,
    };
    const response = await withdrawNativeTransaction(data);
  };

  const nativeWithdraw = async () => {
    const data = {
      sender: "J75jd3kjsABQSDrEdywcyhmbq8eHDowfW9xtEWsVALy9", //wallet public key
      amount: 1,
    };
    const response = await withdrawNativeTokenDeposit(data);
  };

async function recordBalance(amount: number) {
    const response = await client.query(
        q.Create(q.Collection("balances"), {
          data: {
            walletAddress: walletAddress,
            amount: amount,
            createdAt: new Date().toISOString(),
          },
        })
      );
      console.log(response);
}

async function getBalance() {
    const response = await client.query(
        q.Get(q.Match(q.Index("balances_by_walletAddress"), walletAddress))
      )
    return response
}

async function updateBalance(reference: string, amount: number) {
    const response = await client.query(
        q.Update(
            q.Ref(q.Collection("balances"), reference), {
          data: {
            amount: amount,
          },
        })
      );
      console.log(response);
}

async function recordProjects(streamPda: string, receiver_address: string, startTime: number, endTime: number, amount: number, currentStatus: string) {
    const response = await client.query(
        q.Create(q.Collection("projects"), {
          data: {
            pda: streamPda,  
            senderAddress: walletAddress,
            receiverAddress: receiver_address,
            amount: amount,
            start: startTime,
            end: endTime, 
            status: currentStatus
          },
        })
      );
      console.log(response);
}

async function getProjects(pda) {
    const response = await client.query(
        q.Get(q.Match(q.Index("projects_by_pda"), pda))
      )
    return response
}

async function updateProjects(reference: string, status: string) {
    const response = await client.query(
        q.Update(
            q.Ref(q.Collection("projects"), reference), {
          data: {
            status: status,
          },
        })
      );
      console.log(response);
}

async function getProjectsByAddress(address) {
    // const response = await client.query(
    //     q.Map(
    //         q.Paginate(
    //             q.Match(q.Index("projects_by_sender_address"), address)
    //         ),
    //         q.Lambda("senderAddress", q.Get(q.Var("senderAddress")))
    //     )
    // )    

    const response = await client.query(
        q.Paginate(
            q.Match(q.Index("projects_by_sender_address"), address)
                )
    )
    console.log(response)
    return response
}

function constructTable(data) {
             
    let table = 
    '<table class="fl-table">' +
        '<thead>' +
            '<tr>' +
                '<th>PDA</th>' +
                '<th>Receiver Address</th>' +
                '<th>Amount</th>' +
                '<th>Start time</th>' +
                '<th>End Time</th>'+
                '<th>Status</th>' +
             '</tr>' +
         '</thead>' +
         '<tbody>' +
             '<tr>';
             console.log(data['data'][0][0])
    for(let i = 0; i < data['data'].length; i++) {
        table += '<td>' + data['data'][i][0] + '</td>';
        table += '<td>' + data['data'][i][1] + '</td>';
        table += '<td>' + data['data'][i][2] + '</td>';
        table += '<td>' + data['data'][i][3] + '</td>';
        table += '<td>' + data['data'][i][4] + '</td>';
        table += '<td>' + data['data'][i][5] + '</td>';
        if(i < data['data'].length - 1) table += '</tr><tr>';
    }
    table += '</tr></tbody></table>';

    // Your table is ready ! You can deal with it
    console.log(table);
    return table;
}