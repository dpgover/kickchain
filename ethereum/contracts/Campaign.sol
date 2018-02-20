pragma solidity ^0.4.19;

contract Campaign {
    struct Request {
        string description;
        uint payment;
        address supplier;
        bool complete;
        uint approvalCount;
        mapping (address => bool) voters;
    }

    address public manager;
    uint public minimumContribution;
    mapping (address => bool) public contributors;
    uint contributorsCount;
    Request[] public requests;

    modifier onlyOwner() {
        require(msg.sender == manager);
        _;
    }

    modifier onlyContributor() {
        require(contributors[msg.sender]);
        _;
    }

    modifier notCompleted(uint requestId) {
        Request memory request = requests[requestId];

        require(!request.complete);

        _;
    }

    function Campaign(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution);

        contributors[msg.sender] = true;
        contributorsCount++;
    }

    function createRequest(string description, uint value, address supplier) public onlyOwner {
        Request memory request = Request({
            description: description,
            payment: value,
            supplier: supplier,
            complete: false,
            approvalCount: 0
        });

        requests.push(request);
    }

    function approveRequest(uint requestId) public notCompleted(requestId) onlyContributor {
        Request storage request = requests[requestId];

        require(!request.voters[msg.sender]);

        request.voters[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint requestId) public notCompleted(requestId) onlyOwner {
        Request storage request = requests[requestId];

        require(this.balance >= request.payment);
        require(request.approvalCount > (contributorsCount / 2));

        request.complete = true;

        request.supplier.transfer(request.payment);
    }
}
