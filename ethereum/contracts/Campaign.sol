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
    string public name;
    string public description;
    mapping (address => bool) public contributors;
    uint contributorsCount;
    Request[] public requests;
    uint public openRequestsCount;

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

    function Campaign(string _name, string _description, uint _minimumContribution, address creator) public {
        manager = creator;
        name = _name;
        description = _description;
        minimumContribution = _minimumContribution;
    }

    function getCampaignData() public view returns (address, uint, string, string, uint, uint) {
        return (manager, minimumContribution, name, description, contributorsCount, openRequestsCount);
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution);

        contributors[msg.sender] = true;
        contributorsCount++;
    }

    function createRequest(string _description, uint _value, address _supplier) public onlyOwner {
        Request memory request = Request({
            description: _description,
            payment: _value,
            supplier: _supplier,
            complete: false,
            approvalCount: 0
        });

        requests.push(request);
        openRequestsCount++;
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
        openRequestsCount--;

        request.supplier.transfer(request.payment);
    }
}
