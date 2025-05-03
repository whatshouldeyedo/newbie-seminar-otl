import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import lodash from 'lodash'


const prisma = new PrismaClient()




function problem1() {
  return prisma.$queryRaw`select firstName, lastName, income from Customer where income <= 60000 and income >= 50000 order by income desc, lastName asc, firstName asc LIMIT 10;`
}

function problem2() {
  return prisma.$queryRaw`select
    e.SIN,
    b.branchName,
    e.salary,
    m.salary - e.salary as 'Salary Diff'
from
    Employee e, Branch b, Employee m
where
    e.branchNumber = b.branchNumber and b.managerSIN = m.sin and (b.branchNumber = 1 or b.branchNumber = 4)
order by
    m.salary - e.salary desc
LIMIT 10;`
}

function problem3() {
  return prisma.$queryRaw`select
    c.firstName,
    c.lastName,
    c.income
from
    Customer c
where
    c.income >= 2 * (
        select max(c2.income)
        from Customer c2
        where c2.lastName = 'Butler'
    )
order by
    c.lastName asc,
    c.firstName asc
LIMIT 10;`
}

function problem4() {
  return prisma.$queryRaw`select
    c.customerID,
    c.income,
    o.accNumber,
    a.branchNumber
from
    Customer c
        join Owns o on c.customerID = o.customerID
        join Account a on o.accNumber = a.accNumber
where
    c.income > 80000
  and c.customerID in (
    select o1.customerID
    from Owns o1
             join Account a1 on o1.accNumber = a1.accNumber
    where a1.branchNumber = 1
    intersect
    select o2.customerID
    from Owns o2
             join Account a2 on o2.accNumber = a2.accNumber
    where a2.branchNumber = 2
)
order by
    c.customerID asc,
    o.accNumber asc
LIMIT 10;`
}

function problem5() {
  return prisma.$queryRaw`select
    c.customerID,
    a.type,
    a.accNumber,
    a.balance
from
    Customer c
        join Owns o on o.customerID = c.customerID
        join Account a on a.accNumber = o.accNumber
where
    a.type in ('BUS', 'SAV')
order by
    c.customerID asc,
    a.type asc,
    a.accNumber asc
LIMIT 10;`
}

function problem6() {
  return prisma.$queryRaw`select
    b.branchName,
    a.accNumber,
    a.balance
from
    Branch b
    join
        Account a on b.branchNumber = a.branchNumber
where
    a.balance>100000 and b.branchNumber = 1
order by
    a.accNumber asc
LIMIT 10;`
}

function problem7() {
  return prisma.$queryRaw`SELECT DISTINCT O.customerID
FROM Owns O, Account A, Branch B
WHERE O.accNumber = A.accNumber AND A.branchNumber = B.branchNumber AND
      B.branchNumber = 3 AND O.customerID NOT IN (SELECT O1.customerID FROM Owns O1, Owns O2 WHERE O1.accNumber = O2.accNumber AND O2.customerid IN (SELECT O3.customerID FROM Owns O3, Account A, Branch B WHERE O3.accNumber = A.accNumber AND A.branchNumber = B.branchNumber AND B.branchNumber = 1))
ORDER BY O.customerID asc
LIMIT 10;`
}

function problem8() {
  return prisma.$queryRaw`select e.sin, e.firstName, e.lastName, e.salary, b.branchName
from Employee e left outer join Branch b on e.sin = b.managerSIN
where e.salary > 50000
order by branchName desc, e.firstName asc
LIMIT 10;`
}

function problem9() {
  return prisma.$queryRaw`SELECT e.sin, e.firstName, e.lastName, e.salary, b.branchName
FROM Employee e, Branch b
WHERE e.sin = b.managerSIN AND e.salary > 50000

UNION

SELECT e.sin, e.firstName, e.lastName, e.salary, null as branchName
FROM Employee e, Branch b
WHERE e.branchNumber = b.branchNumber AND e.salary > 50000 AND e.sin <> b.managerSIN

ORDER BY branchName DESC, firstName ASC
LIMIT 10;
`
}

function problem10() {
  return prisma.$queryRaw`select c.customerID, c.firstName, c.lastName, c.income
from Customer c
where c.income > 5000 and not exists(select 1 from Account ah join Owns oh on ah.accNumber = oh.accNumber where oh.customerID = (select h.customerID from Customer h where h.firstName = 'Helen' and h.lastName='Morgan') and not exists(select 1 from Account ac join Owns oc on ac.accNumber = oc.accNumber where oc.customerID = c.customerID and ac.branchNumber = ah.branchNumber))
order by c.income desc
LIMIT 10;`
}

function problem11() {
  return prisma.$queryRaw`select e.sin, e.firstName, e.lastName, e.salary
from Employee e
where e.branchNumber = 4
order by salary asc
LIMIT 1;`
}

function problem14() {
  return prisma.$queryRaw`select sum(e.salary) as "sum of employees salaries"
from Employee e, Branch b
where e.branchNumber = b.branchNumber and b.branchNumber = 5`
}

function problem15() {
  return prisma.$queryRaw`select c.customerID, c.firstName, c.lastName
from Customer c
where c.customerID in (select o.customerID from Owns o join Account a on o.accNumber = a.accNumber group by o.customerID having count(distinct a.branchNumber) = 4)
order by c.lastName, c.firstName
LIMIT 10;`
}


function problem17() {
  return prisma.$queryRaw`select c.customerID, c.firstName, c.lastName, c.income, avg(a.balance) as "average account balance"
from Customer c join Owns o on c.customerID = o.customerID join Account a on a.accNumber = o.accNumber
where c.lastName like 'S%e%'
group by c.customerID, c.firstName, c.lastName, c.income
having count(o.accNumber) >= 3
order by c.customerID
LIMIT 10;`
}

function problem18() {
  return prisma.$queryRaw`select a.accNumber, a.balance, sum(t.amount) as "sum of transaction amounts"
from Account a join Transactions t on a.accNumber = t.accNumber
where a.branchNumber = 4
group by a.accNumber, a.balance
having count(t.transNumber) >= 10
order by sum(t.amount)
LIMIT 10;`
}

const ProblemList = [
  problem1, problem2, problem3, problem4, problem5, problem6, problem7, problem8, problem9, problem10,
  problem11, problem14, problem15, problem17, problem18
]


async function main() {
  for (let i = 0; i < ProblemList.length; i++) {
    const result = await ProblemList[i]()
    const answer =  JSON.parse(fs.readFileSync(`${ProblemList[i].name}.json`,'utf-8'));
    lodash.isEqual(result, answer) ? console.log(`${ProblemList[i].name}: Correct`) : console.log(`${ProblemList[i].name}: Incorrect`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })