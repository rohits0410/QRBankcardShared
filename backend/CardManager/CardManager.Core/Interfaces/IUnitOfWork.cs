using CardManager.Core.Entities;

namespace CardManager.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<BankCard> BankCards { get; }
    Task<int> CompleteAsync();
}