using CardManager.Core.Entities;
using CardManager.Core.Interfaces;
using CardManager.Infrastructure.Data;
using CardManager.Infrastructure.Repositories;

namespace CardManager.Infrastructure.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IRepository<User>? _users;
    private IRepository<BankCard>? _bankCards;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IRepository<User> Users =>
        _users ??= new Repository<User>(_context);

    public IRepository<BankCard> BankCards =>
        _bankCards ??= new Repository<BankCard>(_context);

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}